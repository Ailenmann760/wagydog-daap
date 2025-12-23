'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../SocketProvider';
import { Zap, Clock, ArrowUpRight, Copy, Check, ExternalLink } from 'lucide-react';
import axios from 'axios';

// Chain colors and icons
const CHAIN_CONFIG = {
    ethereum: { color: '#627EEA', bg: 'bg-blue-500/20', label: 'ETH' },
    bsc: { color: '#F3BA2F', bg: 'bg-yellow-500/20', label: 'BSC' },
    solana: { color: '#9945FF', bg: 'bg-purple-500/20', label: 'SOL' },
    base: { color: '#0052FF', bg: 'bg-blue-600/20', label: 'BASE' },
    arbitrum: { color: '#28A0F0', bg: 'bg-cyan-500/20', label: 'ARB' },
};

export default function NewTokensLive({ limit = 20 }) {
    const { socket, connected } = useSocket();
    const [newPools, setNewPools] = useState([]);
    const [selectedChain, setSelectedChain] = useState(null);
    const [copiedAddress, setCopiedAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const chainParam = selectedChain ? `&chain=${selectedChain}` : '';
                const response = await axios.get(`${apiUrl}/api/tokens/new?limit=${limit}${chainParam}`);
                if (response.data.success) {
                    setNewPools(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching new tokens:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [selectedChain, limit]);

    // Subscribe to WebSocket updates
    useEffect(() => {
        if (!socket || !connected) return;

        socket.emit('subscribe:newPools', selectedChain);

        const handleRecentPools = (pools) => {
            setNewPools(prev => {
                const existing = new Set(prev.map(p => p.address));
                const newItems = pools.filter(p => !existing.has(p.address));
                return [...newItems, ...prev].slice(0, limit);
            });
        };

        const handleNewPool = (pool) => {
            setNewPools(prev => {
                if (prev.some(p => p.address === pool.address)) return prev;
                return [pool, ...prev].slice(0, limit);
            });
        };

        socket.on('recentPools', handleRecentPools);
        socket.on('newPool', handleNewPool);

        return () => {
            socket.emit('unsubscribe:newPools', selectedChain);
            socket.off('recentPools', handleRecentPools);
            socket.off('newPool', handleNewPool);
        };
    }, [socket, connected, selectedChain, limit]);

    const copyAddress = useCallback(async (address) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }, []);

    const formatAge = (seconds) => {
        if (!seconds || seconds < 0) return 'Unknown';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    const getSnipeScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <section className="glass-surface rounded-surface p-4 sm:p-6">
            {/* Header - Stacked on mobile */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                        <Zap className="text-yellow-400" size={22} />
                        {connected && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold">New Tokens (Live)</h2>
                </div>

                {/* Chain Filter - Scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    <button
                        onClick={() => setSelectedChain(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${!selectedChain ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        All
                    </button>
                    {Object.entries(CHAIN_CONFIG).map(([chain, config]) => (
                        <button
                            key={chain}
                            onClick={() => setSelectedChain(chain)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${selectedChain === chain ? config.bg + ' text-white' : 'bg-white/5 hover:bg-white/10'
                                }`}
                            style={{ borderColor: selectedChain === chain ? config.color : 'transparent' }}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-bg-surface rounded-lg animate-shimmer" />
                    ))}
                </div>
            ) : (
                /* Token List */
                <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {newPools.map((pool, index) => {
                        const chainConfig = CHAIN_CONFIG[pool.chain] || CHAIN_CONFIG.ethereum;
                        const isVeryNew = pool.ageSeconds && pool.ageSeconds < 300;

                        return (
                            <div
                                key={pool.address || index}
                                className={`p-3 sm:p-4 rounded-lg border transition-all hover:bg-white/5 ${isVeryNew ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border/50 bg-bg-surface/50'
                                    }`}
                            >
                                {/* Mobile Layout */}
                                <div className="flex flex-col gap-3 sm:hidden">
                                    {/* Row 1: Chain + Token Name + Age */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`px-2 py-0.5 rounded text-xs font-bold ${chainConfig.bg}`}
                                                style={{ color: chainConfig.color }}
                                            >
                                                {chainConfig.label}
                                            </div>
                                            <span className="font-bold text-base truncate max-w-[120px]">
                                                {pool.baseToken?.symbol || pool.symbol || 'TOKEN'}
                                            </span>
                                            {isVeryNew && (
                                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded font-medium animate-pulse">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-text-muted">
                                            <Clock size={12} />
                                            <span className={`text-xs font-medium ${isVeryNew ? 'text-yellow-400' : ''}`}>
                                                {pool.ageFormatted || formatAge(pool.ageSeconds)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Row 2: Stats + Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="text-xs text-text-muted">Liquidity</div>
                                                <div className="font-semibold text-sm">
                                                    ${pool.liquidity >= 1000
                                                        ? `${(pool.liquidity / 1000).toFixed(1)}k`
                                                        : pool.liquidity?.toFixed(0) || '0'}
                                                </div>
                                            </div>
                                            {pool.snipeScore !== undefined && (
                                                <div>
                                                    <div className="text-xs text-text-muted">Score</div>
                                                    <div className={`font-bold text-sm ${getSnipeScoreColor(pool.snipeScore)}`}>
                                                        {pool.snipeScore}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => copyAddress(pool.baseToken?.address || pool.address)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                            >
                                                {copiedAddress === (pool.baseToken?.address || pool.address) ? (
                                                    <Check size={14} className="text-green-400" />
                                                ) : (
                                                    <Copy size={14} className="text-text-muted" />
                                                )}
                                            </button>
                                            <a
                                                href={pool.url || `https://www.geckoterminal.com/${pool.chain}/pools/${pool.address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                            >
                                                <ExternalLink size={14} className="text-text-muted" />
                                            </a>
                                            <a
                                                href={`/token/${pool.baseToken?.address || pool.address}?chain=${pool.chain}`}
                                                className="flex items-center gap-1 px-2 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition text-xs font-medium"
                                            >
                                                View <ArrowUpRight size={12} />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:flex items-center justify-between">
                                    {/* Token Info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div
                                            className={`px-2 py-1 rounded text-xs font-bold ${chainConfig.bg}`}
                                            style={{ color: chainConfig.color }}
                                        >
                                            {chainConfig.label}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg truncate">
                                                    {pool.baseToken?.symbol || pool.symbol || 'TOKEN'}
                                                </span>
                                                {isVeryNew && (
                                                    <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded font-medium animate-pulse">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-text-muted truncate">
                                                {pool.baseToken?.name || pool.name || 'Unknown Token'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Age */}
                                    <div className="flex items-center gap-1 text-text-muted px-3">
                                        <Clock size={14} />
                                        <span className={`text-sm font-medium ${isVeryNew ? 'text-yellow-400' : ''}`}>
                                            {pool.ageFormatted || formatAge(pool.ageSeconds)}
                                        </span>
                                    </div>

                                    {/* Liquidity */}
                                    <div className="text-right px-3 min-w-[100px]">
                                        <div className="text-xs text-text-muted">Liquidity</div>
                                        <div className="font-semibold">
                                            ${pool.liquidity >= 1000
                                                ? `${(pool.liquidity / 1000).toFixed(1)}k`
                                                : pool.liquidity?.toFixed(0) || '0'}
                                        </div>
                                    </div>

                                    {/* Snipe Score */}
                                    {pool.snipeScore !== undefined && (
                                        <div className="text-right px-3 min-w-[80px]">
                                            <div className="text-xs text-text-muted">Score</div>
                                            <div className={`font-bold ${getSnipeScoreColor(pool.snipeScore)}`}>
                                                {pool.snipeScore}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyAddress(pool.baseToken?.address || pool.address)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition"
                                            title="Copy address"
                                        >
                                            {copiedAddress === (pool.baseToken?.address || pool.address) ? (
                                                <Check size={16} className="text-green-400" />
                                            ) : (
                                                <Copy size={16} className="text-text-muted" />
                                            )}
                                        </button>
                                        <a
                                            href={pool.url || `https://www.geckoterminal.com/${pool.chain}/pools/${pool.address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-white/10 rounded-lg transition"
                                            title="View on GeckoTerminal"
                                        >
                                            <ExternalLink size={16} className="text-text-muted" />
                                        </a>
                                        <a
                                            href={`/token/${pool.baseToken?.address || pool.address}?chain=${pool.chain}`}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition text-sm font-medium"
                                        >
                                            View <ArrowUpRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Connection Status */}
            <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                    {connected ? 'Live updates active' : 'Connecting...'}
                </div>
                <div>{newPools.length} tokens</div>
            </div>
        </section>
    );
}
