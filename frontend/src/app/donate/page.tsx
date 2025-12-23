'use client';

import { useState } from 'react';
import { Heart, Copy, Check, ExternalLink, Wallet, TrendingUp } from 'lucide-react';
import { useAccount, useConnect, useSendTransaction, useBalance } from 'wagmi';
import { parseEther } from 'viem';

// Donation wallet address (same across all chains)
const DONATION_WALLET = '0xb50ea4506b9a7d41c1bdb650bd0b00487fb6daf0';

// Supported networks configuration
const NETWORKS = [
    {
        id: 'ethereum',
        name: 'Ethereum',
        icon: '⟠',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        tokens: ['ETH', 'USDT'],
        explorer: 'https://etherscan.io/address/',
        chainId: 1,
    },
    {
        id: 'bsc',
        name: 'BNB Chain',
        icon: '🔶',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        tokens: ['BNB', 'USDT'],
        explorer: 'https://bscscan.com/address/',
        chainId: 56,
    },
    {
        id: 'base',
        name: 'Base',
        icon: '🔵',
        color: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
        tokens: ['ETH'],
        explorer: 'https://basescan.org/address/',
        chainId: 8453,
    },
    {
        id: 'arbitrum',
        name: 'Arbitrum',
        icon: '🔷',
        color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        tokens: ['ETH'],
        explorer: 'https://arbiscan.io/address/',
        chainId: 42161,
    },
];

export default function DonatePage() {
    const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
    const [copied, setCopied] = useState(false);
    const [donateAmount, setDonateAmount] = useState('');
    const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { sendTransaction, isPending } = useSendTransaction();
    const { data: balance } = useBalance({ address });

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(DONATION_WALLET);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDonate = async () => {
        if (!donateAmount || parseFloat(donateAmount) <= 0) return;

        try {
            setTxStatus('pending');
            sendTransaction({
                to: DONATION_WALLET as `0x${string}`,
                value: parseEther(donateAmount),
            });
            setTxStatus('success');
            setDonateAmount('');
        } catch (error) {
            setTxStatus('error');
        }
    };

    return (
        <div className="space-y-6 p-4 lg:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-4">
                    <Heart size={32} className="text-pink-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Support Wagydog</h1>
                <p className="text-text-muted mt-2 max-w-xl mx-auto">
                    Help us keep Wagydog running! Your donations go directly towards server costs,
                    API fees, and continuous development.
                </p>
            </div>

            {/* Network Selector */}
            <div className="glass-surface rounded-xl p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Select Network</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {NETWORKS.map((network) => (
                        <button
                            key={network.id}
                            onClick={() => setSelectedNetwork(network)}
                            className={`p-3 sm:p-4 rounded-xl border transition-all ${selectedNetwork.id === network.id
                                    ? network.color + ' border-2'
                                    : 'bg-white/5 border-border/50 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-2xl block mb-1">{network.icon}</span>
                            <span className="font-medium text-sm">{network.name}</span>
                            <div className="text-xs text-text-muted mt-1">
                                {network.tokens.join(', ')}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Donation Address */}
            <div className="glass-surface rounded-xl p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Donate on {selectedNetwork.name}
                </h2>

                <div className="mb-4">
                    <label className="text-sm text-text-muted block mb-2">
                        Send {selectedNetwork.tokens.join(' or ')} to this address:
                    </label>
                    <div className="bg-bg-surface rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2">
                        <code className="text-xs sm:text-sm text-green-400 break-all font-mono">
                            {DONATION_WALLET}
                        </code>
                        <button
                            onClick={handleCopy}
                            className={`shrink-0 p-2 sm:px-3 sm:py-2 rounded-lg transition flex items-center gap-2 ${copied
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                </div>

                {/* View on Explorer */}
                <a
                    href={`${selectedNetwork.explorer}${DONATION_WALLET}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                    View on {selectedNetwork.name} Explorer <ExternalLink size={14} />
                </a>
            </div>

            {/* Quick Donate with Wallet */}
            <div className="glass-surface rounded-xl p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wallet size={20} />
                    Quick Donate
                </h2>

                {isConnected ? (
                    <div className="space-y-4">
                        <div className="text-sm text-text-muted">
                            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                            {balance && (
                                <span className="ml-2">
                                    (Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol})
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="number"
                                value={donateAmount}
                                onChange={(e) => setDonateAmount(e.target.value)}
                                placeholder="0.01"
                                step="0.01"
                                min="0"
                                className="flex-1 bg-bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-primary"
                            />
                            <button
                                onClick={handleDonate}
                                disabled={isPending || !donateAmount}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'Sending...' : 'Donate'}
                            </button>
                        </div>

                        {txStatus === 'success' && (
                            <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                Thank you for your donation! 💖
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-text-muted mb-4">Connect your wallet to donate directly</p>
                        <button
                            onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl transition"
                        >
                            Connect Wallet
                        </button>
                    </div>
                )}
            </div>

            {/* Transparency Dashboard */}
            <div className="glass-surface rounded-xl p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Transparency Dashboard
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-bg-surface rounded-xl p-4 text-center">
                        <div className="text-xs text-text-muted mb-1">Total Received</div>
                        <div className="text-xl font-bold text-green-400">$0.00</div>
                        <div className="text-xs text-text-muted">All chains</div>
                    </div>
                    <div className="bg-bg-surface rounded-xl p-4 text-center">
                        <div className="text-xs text-text-muted mb-1">This Month</div>
                        <div className="text-xl font-bold text-blue-400">$0.00</div>
                        <div className="text-xs text-text-muted">Dec 2024</div>
                    </div>
                    <div className="bg-bg-surface rounded-xl p-4 text-center">
                        <div className="text-xs text-text-muted mb-1">Contributors</div>
                        <div className="text-xl font-bold text-purple-400">0</div>
                        <div className="text-xs text-text-muted">Unique wallets</div>
                    </div>
                </div>

                <div className="text-center text-text-muted text-sm">
                    <p>All funds are used for:</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs">🖥️ Server Costs</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs">📊 API Fees</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs">🔧 Development</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs">🛡️ Security</span>
                    </div>
                </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center text-text-muted text-sm">
                <p>Every donation, no matter how small, helps keep Wagydog free for everyone. 💖</p>
            </div>
        </div>
    );
}
