'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAccount, useConnect, useDisconnect, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Presale Configuration
const PRESALE_WALLET = process.env.NEXT_PUBLIC_PRESALE_WALLET || '0xb50ea4506b9a7d41c1bdb650bd0b00487fb6daf0';
const PRESALE_TARGET = Number(process.env.NEXT_PUBLIC_PRESALE_TARGET) || 50000;
const PRESALE_MIN = Number(process.env.NEXT_PUBLIC_PRESALE_MIN) || 20;
const PRESALE_MAX = Number(process.env.NEXT_PUBLIC_PRESALE_MAX) || 300;
const WAGY_PER_BNB = Number(process.env.NEXT_PUBLIC_WAGY_PER_BNB) || 630000;
const BNB_PRICE_USD = 300;

interface PresaleStats {
    totalBnb: string;
    totalUsd: number;
    contributorCount: number;
}

export default function PresaleWidget() {
    const [amount, setAmount] = useState('');
    const [presaleStats, setPresaleStats] = useState<PresaleStats>({ totalBnb: '0', totalUsd: 0, contributorCount: 0 });
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [txMessage, setTxMessage] = useState('');

    // Wagmi hooks
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({ address });

    const { data: hash, sendTransaction, isPending } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Fetch presale stats
    const fetchPresaleStats = useCallback(async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/api/presale/stats`);
            if (res.ok) {
                const data = await res.json();
                setPresaleStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch presale stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchPresaleStats();
        const interval = setInterval(fetchPresaleStats, 30000);
        return () => clearInterval(interval);
    }, [fetchPresaleStats]);

    useEffect(() => {
        if (isConfirmed) {
            setTxStatus('success');
            setTxMessage('Transaction confirmed! Thank you for participating!');
            fetchPresaleStats();
        }
    }, [isConfirmed, fetchPresaleStats]);

    const calculateTokens = (bnbAmount: string) => {
        const bnb = parseFloat(bnbAmount) || 0;
        return Math.floor(bnb * WAGY_PER_BNB);
    };

    const calculateUsd = (bnbAmount: string) => {
        const bnb = parseFloat(bnbAmount) || 0;
        return (bnb * BNB_PRICE_USD).toFixed(2);
    };

    const validateAmount = (bnbAmount: string): { valid: boolean; error: string } => {
        const bnb = parseFloat(bnbAmount) || 0;
        const usd = bnb * BNB_PRICE_USD;

        if (bnb <= 0) return { valid: false, error: 'Enter an amount' };
        if (usd < PRESALE_MIN) return { valid: false, error: `Minimum $${PRESALE_MIN}` };
        if (usd > PRESALE_MAX) return { valid: false, error: `Maximum $${PRESALE_MAX}` };
        if (balance && bnb > parseFloat(formatEther(balance.value))) {
            return { valid: false, error: 'Insufficient balance' };
        }
        return { valid: true, error: '' };
    };

    const handleContribute = async () => {
        const validation = validateAmount(amount);
        if (!validation.valid) {
            setTxMessage(validation.error);
            return;
        }

        try {
            setTxStatus('pending');
            setTxMessage('Confirming transaction...');

            sendTransaction({
                to: PRESALE_WALLET as `0x${string}`,
                value: parseEther(amount),
            });
        } catch (error) {
            setTxStatus('error');
            setTxMessage('Transaction failed. Please try again.');
        }
    };

    const handleConnectWallet = (connector: any) => {
        connect({ connector });
        setShowWalletModal(false);
    };

    const progressPercent = Math.min((presaleStats.totalUsd / PRESALE_TARGET) * 100, 100);

    // Copy Address Box with success state
    const CopyAddressBox = ({ address }: { address: string }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = async () => {
            try {
                await navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        };

        return (
            <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                <code className="text-xs sm:text-sm text-green-400 break-all">{address}</code>
                <button
                    onClick={handleCopy}
                    className={`shrink-0 px-3 py-1.5 rounded text-xs transition flex items-center gap-1 ${copied
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    {copied ? '✓ Copied!' : 'Copy'}
                </button>
            </div>
        );
    };

    // Wallet Modal
    const WalletModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowWalletModal(false)}>
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
                <p className="text-slate-400 text-sm mb-6">Choose your preferred wallet to participate in the presale</p>

                <div className="space-y-3">
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            onClick={() => handleConnectWallet(connector)}
                            disabled={isConnecting}
                            className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700 hover:border-blue-500/50 disabled:opacity-50"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                {connector.name === 'MetaMask' && <span className="text-2xl">🦊</span>}
                                {connector.name === 'WalletConnect' && <span className="text-2xl">🔗</span>}
                                {connector.name === 'Injected' && <span className="text-2xl">💼</span>}
                                {!['MetaMask', 'WalletConnect', 'Injected'].includes(connector.name) && <span className="text-2xl">👛</span>}
                            </div>
                            <div className="text-left">
                                <span className="text-white font-semibold block">
                                    {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
                                </span>
                                <span className="text-slate-400 text-xs">
                                    {connector.name === 'MetaMask' && 'Popular browser extension'}
                                    {connector.name === 'WalletConnect' && 'Trust Wallet, Binance & more'}
                                    {connector.name === 'Injected' && 'Use your browser wallet'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowWalletModal(false)}
                    className="mt-6 w-full py-3 text-slate-400 hover:text-white transition border border-slate-700 rounded-xl hover:border-slate-600"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div className="presale-widget relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-green-500/40">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-blue-600/10" />

            {/* Header */}
            <div className="relative p-4 sm:p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <Image src="/wagydog-logo.png" alt="Wagydog" width={48} height={48} className="object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">WAGYDOG Presale</h2>
                            <p className="text-green-400 text-sm font-medium">Community Round - LIVE</p>
                        </div>
                    </div>

                    {isConnected ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400 hidden sm:inline">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                            <button
                                onClick={() => disconnect()}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowWalletModal(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-green-500/25"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>

            {/* Progress */}
            <div className="relative p-4 sm:p-6">
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Raised</span>
                        <span className="text-white font-bold">${presaleStats.totalUsd.toLocaleString()} / ${PRESALE_TARGET.toLocaleString()}</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs mt-2 text-slate-500">
                        <span>{presaleStats.totalBnb} BNB</span>
                        <span>{progressPercent.toFixed(1)}%</span>
                    </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Rate</p>
                        <p className="text-sm font-bold text-white">1 BNB = {WAGY_PER_BNB.toLocaleString()} WAGY</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Limits</p>
                        <p className="text-sm font-bold text-white">${PRESALE_MIN} - ${PRESALE_MAX}</p>
                    </div>
                </div>

                {/* Contribution Form */}
                {isConnected ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Amount (BNB)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.0"
                                    step="0.01"
                                    min="0"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg placeholder-slate-500 focus:outline-none focus:border-green-500"
                                />
                                <button
                                    onClick={() => balance && setAmount(formatEther(balance.value))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded hover:bg-slate-600"
                                >
                                    MAX
                                </button>
                            </div>
                            {amount && (
                                <div className="mt-2 text-sm text-slate-400">
                                    ≈ ${calculateUsd(amount)} | You receive: <span className="text-green-400 font-bold">{calculateTokens(amount).toLocaleString()} WAGY</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleContribute}
                            disabled={isPending || isConfirming || !validateAmount(amount).valid}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition ${isPending || isConfirming
                                ? 'bg-slate-600 text-slate-400 cursor-wait'
                                : validateAmount(amount).valid
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isPending || isConfirming ? 'Processing...' : 'Contribute BNB'}
                        </button>

                        {txMessage && (
                            <div className={`p-3 rounded-lg text-sm ${txStatus === 'success' ? 'bg-green-500/20 text-green-400' :
                                txStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                {txMessage}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-400 mb-4">Connect your wallet to participate</p>
                        <button
                            onClick={() => setShowWalletModal(true)}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-green-500/25"
                        >
                            Connect Wallet
                        </button>
                    </div>
                )}

                {/* Manual Option */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                    <p className="text-center text-sm text-slate-400 mb-3">Or send BNB/USDT (BEP-20) directly to:</p>
                    <CopyAddressBox address={PRESALE_WALLET} />
                </div>
            </div>

            {showWalletModal && <WalletModal />}
        </div>
    );
}
