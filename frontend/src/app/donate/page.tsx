'use client';

import { useState } from 'react';
import { Heart, Copy, Check, ExternalLink, Wallet, TrendingUp } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useSendTransaction, useBalance } from 'wagmi';
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
    const [showWalletModal, setShowWalletModal] = useState(false);

    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
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

    const handleConnectWallet = (connector: any) => {
        connect({ connector });
        setShowWalletModal(false);
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

    // Wallet Modal Component
    const WalletModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowWalletModal(false)}>
            <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
                <p className="text-slate-400 text-sm mb-6">Choose your preferred wallet to donate</p>

                <div className="space-y-3">
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            onClick={() => handleConnectWallet(connector)}
                            disabled={isConnecting}
                            className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700 hover:border-pink-500/50 disabled:opacity-50"
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
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-text-muted">
                                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                                {balance && (
                                    <span className="ml-2">
                                        (Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol})
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => disconnect()}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Disconnect
                            </button>
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
                            onClick={() => setShowWalletModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl transition"
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

            {/* Wallet Modal */}
            {showWalletModal && <WalletModal />}
        </div>
    );
}
