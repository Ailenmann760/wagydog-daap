'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Flame, Clock, ExternalLink, AlertTriangle, Shield, Copy, Check, Zap, RefreshCw } from 'lucide-react';
import ChainSelector from '../../components/ui/ChainSelector';

// Chain configuration
const CHAIN_CONFIG = {
    ethereum: {
        name: 'Ethereum',
        icon: '⟠',
        color: 'bg-blue-500/20 text-blue-400',
        explorer: 'https://etherscan.io',
        dexScreener: 'https://dexscreener.com/ethereum/',
        tokenSniffer: 'https://tokensniffer.com/token/eth/',
    },
    bsc: {
        name: 'BSC',
        icon: '🔶',
        color: 'bg-yellow-500/20 text-yellow-400',
        explorer: 'https://bscscan.com',
        dexScreener: 'https://dexscreener.com/bsc/',
        tokenSniffer: 'https://tokensniffer.com/token/bsc/',
    },
    base: {
        name: 'Base',
        icon: '🔵',
        color: 'bg-blue-600/20 text-blue-300',
        explorer: 'https://basescan.org',
        dexScreener: 'https://dexscreener.com/base/',
        tokenSniffer: 'https://tokensniffer.com/token/base/',
    },
    arbitrum: {
        name: 'Arbitrum',
        icon: '🔷',
        color: 'bg-cyan-500/20 text-cyan-400',
        explorer: 'https://arbiscan.io',
        dexScreener: 'https://dexscreener.com/arbitrum/',
        tokenSniffer: 'https://tokensniffer.com/token/arb/',
    },
    solana: {
        name: 'Solana',
        icon: '◎',
        color: 'bg-purple-500/20 text-purple-400',
        explorer: 'https://solscan.io',
        dexScreener: 'https://dexscreener.com/solana/',
        tokenSniffer: 'https://rugcheck.xyz/tokens/',
    },
};

export default function DegenPage() {
    const [selectedChain, setSelectedChain] = useState<string | null>(null);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch new tokens with no/low liquidity
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['degen-tokens', selectedChain],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const chainParam = selectedChain ? `&chain=${selectedChain}` : '';
            // Use new tokens endpoint - these are the freshest deployments
            const response = await axios.get(`${apiUrl}/api/tokens/new?limit=50${chainParam}`);
            return response.data.data || [];
        },
        refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    });

    const copyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatAge = (seconds: number) => {
        if (!seconds || seconds < 0) return 'Unknown';
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getLiquidityStatus = (liquidity: number) => {
        if (!liquidity || liquidity === 0) {
            return { label: 'NO LIQ', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle };
        }
        if (liquidity < 1000) {
            return { label: 'LOW LIQ', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle };
        }
        return { label: 'HAS LIQ', color: 'bg-green-500/20 text-green-400', icon: Shield };
    };

    return (
        <div className="space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Flame size={28} className="text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Degen Trader Tool</h1>
                        <p className="text-text-muted text-sm sm:text-base">
                            Spot newly deployed tokens before liquidity is added
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <ChainSelector
                        selectedChain={selectedChain}
                        onChainChange={setSelectedChain}
                    />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${autoRefresh
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                                }`}
                        >
                            <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
                            {autoRefresh ? 'Live' : 'Paused'}
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-orange-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold text-orange-400 mb-1">⚠️ High Risk Warning</p>
                    <p className="text-text-muted">
                        Newly deployed tokens are extremely risky. Many are scams, rugs, or honeypots.
                        Always DYOR and never invest more than you can afford to lose.
                    </p>
                </div>
            </div>

            {/* Token List */}
            <div className="glass-surface rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-lg animate-shimmer" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-400">
                        Failed to load tokens. Please try again.
                    </div>
                ) : data?.length === 0 ? (
                    <div className="p-8 text-center text-text-muted">
                        No new deployments found. Check back soon!
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {data?.map((token: any, index: number) => {
                            const chain = token.chain || 'ethereum';
                            const chainConfig = CHAIN_CONFIG[chain as keyof typeof CHAIN_CONFIG] || CHAIN_CONFIG.ethereum;
                            const liquidityStatus = getLiquidityStatus(token.liquidity);
                            const LiqIcon = liquidityStatus.icon;
                            const address = token.baseToken?.address || token.address;

                            return (
                                <div key={address || index} className="p-4 hover:bg-white/5 transition">
                                    {/* Mobile Layout */}
                                    <div className="sm:hidden space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${chainConfig.color}`}>
                                                    {chainConfig.icon} {chainConfig.name}
                                                </span>
                                                <span className="font-bold">
                                                    {token.baseToken?.symbol || token.symbol || 'TOKEN'}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${liquidityStatus.color}`}>
                                                <LiqIcon size={12} />
                                                {liquidityStatus.label}
                                            </div>
                                        </div>

                                        <div className="text-xs text-text-muted truncate">
                                            {token.baseToken?.name || token.name || 'Unknown Token'}
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1 text-text-muted">
                                                <Clock size={12} />
                                                {token.ageFormatted || formatAge(token.ageSeconds)}
                                            </div>
                                            <div className="text-text-muted">
                                                Liq: ${token.liquidity?.toFixed(0) || '0'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => copyAddress(address)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-xs"
                                            >
                                                {copiedAddress === address ? (
                                                    <><Check size={12} className="text-green-400" /> Copied</>
                                                ) : (
                                                    <><Copy size={12} /> Copy CA</>
                                                )}
                                            </button>
                                            <a
                                                href={`${chainConfig.tokenSniffer}${address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg transition text-xs"
                                            >
                                                <Shield size={12} /> Check
                                            </a>
                                            <a
                                                href={`${chainConfig.dexScreener}${address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition text-xs"
                                            >
                                                <Zap size={12} /> Chart
                                            </a>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden sm:flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${chainConfig.color}`}>
                                                {chainConfig.icon} {chainConfig.name}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">
                                                        {token.baseToken?.symbol || token.symbol || 'TOKEN'}
                                                    </span>
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${liquidityStatus.color}`}>
                                                        <LiqIcon size={12} />
                                                        {liquidityStatus.label}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-text-muted truncate max-w-[200px]">
                                                    {token.baseToken?.name || token.name || 'Unknown Token'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <div className="text-xs text-text-muted">Age</div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {token.ageFormatted || formatAge(token.ageSeconds)}
                                                </div>
                                            </div>
                                            <div className="text-center min-w-[80px]">
                                                <div className="text-xs text-text-muted">Liquidity</div>
                                                <div className="font-medium">
                                                    ${token.liquidity >= 1000
                                                        ? `${(token.liquidity / 1000).toFixed(1)}k`
                                                        : token.liquidity?.toFixed(0) || '0'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => copyAddress(address)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                                title="Copy Contract Address"
                                            >
                                                {copiedAddress === address ? (
                                                    <Check size={16} className="text-green-400" />
                                                ) : (
                                                    <Copy size={16} className="text-text-muted" />
                                                )}
                                            </button>
                                            <a
                                                href={`${chainConfig.explorer}/token/${address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                                title="View on Explorer"
                                            >
                                                <ExternalLink size={16} className="text-text-muted" />
                                            </a>
                                            <a
                                                href={`${chainConfig.tokenSniffer}${address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg transition text-sm font-medium"
                                            >
                                                <Shield size={14} /> Check Contract
                                            </a>
                                            <a
                                                href={`${chainConfig.dexScreener}${address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition text-sm font-medium"
                                            >
                                                <Zap size={14} /> Snipe
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="text-center text-text-muted text-sm">
                <p>Data refreshes every 10 seconds. Use at your own risk.</p>
            </div>
        </div>
    );
}
