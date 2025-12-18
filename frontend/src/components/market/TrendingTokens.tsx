'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Sparkles } from 'lucide-react';
import { useSocket } from '../SocketProvider';
import Link from 'next/link';

// Chain configuration
const CHAIN_CONFIG = {
    ethereum: { color: '#627EEA', bg: 'bg-blue-500/20', label: 'ETH', icon: '⟠' },
    bsc: { color: '#F3BA2F', bg: 'bg-yellow-500/20', label: 'BSC', icon: '🔶' },
    solana: { color: '#9945FF', bg: 'bg-purple-500/20', label: 'SOL', icon: '◎' },
    base: { color: '#0052FF', bg: 'bg-blue-600/20', label: 'BASE', icon: '🔵' },
    arbitrum: { color: '#28A0F0', bg: 'bg-cyan-500/20', label: 'ARB', icon: '🔷' },
};

export default function TrendingTokens({ limit = 24 }) {
    const { socket, connected } = useSocket();
    const [liveUpdates, setLiveUpdates] = useState({});

    const { data, isLoading, error } = useQuery({
        queryKey: ['trending'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/tokens/trending?limit=${limit}`);
            return response.data.data;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Subscribe to trending updates
    useEffect(() => {
        if (!socket || !connected) return;

        socket.emit('subscribe:trending');

        const handleTrendingUpdate = (trending) => {
            // Create a map of updates for quick lookup
            const updates = {};
            trending.forEach(t => {
                updates[t.address] = t;
            });
            setLiveUpdates(updates);
        };

        socket.on('trending:update', handleTrendingUpdate);

        return () => {
            socket.off('trending:update', handleTrendingUpdate);
        };
    }, [socket, connected]);

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        if (price < 0.00001) return `$${price.toExponential(2)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatVolume = (volume) => {
        if (!volume) return '$0';
        if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
        if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
        return `$${volume.toFixed(0)}`;
    };

    const getSnipeScoreColor = (score) => {
        if (score >= 80) return 'text-green-400 bg-green-400/20';
        if (score >= 60) return 'text-yellow-400 bg-yellow-400/20';
        if (score >= 40) return 'text-orange-400 bg-orange-400/20';
        return 'text-red-400 bg-red-400/20';
    };

    return (
        <section className="glass-surface rounded-surface p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-primary" size={24} />
                    <h2 className="text-2xl font-bold">🔥 Trending Tokens</h2>
                    {connected && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Live
                        </span>
                    )}
                </div>
                <div className="text-sm text-text-muted">
                    Updated {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-bg-surface rounded-lg animate-shimmer" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-400">
                    Failed to load trending tokens. Please try again.
                </div>
            ) : (
                /* Token Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data?.map((item, index) => {
                        const pool = liveUpdates[item.address] || item;
                        const chainConfig = CHAIN_CONFIG[pool.chain] || CHAIN_CONFIG.ethereum;
                        const isPositive = (pool.priceChange24h || 0) >= 0;
                        const isVeryNew = pool.ageSeconds && pool.ageSeconds < 3600;

                        return (
                            <Link
                                key={pool.address || index}
                                href={`/token/${pool.baseToken?.address || pool.address}?chain=${pool.chain}`}
                                className="block group"
                            >
                                <div className="relative p-4 rounded-xl border border-border/50 bg-bg-surface/50 hover:bg-white/5 hover:border-primary/30 transition-all duration-200">
                                    {/* Rank Badge */}
                                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </div>

                                    {/* Chain Badge */}
                                    <div className="absolute top-2 right-2">
                                        <div
                                            className={`px-2 py-0.5 rounded text-xs font-bold ${chainConfig.bg}`}
                                            style={{ color: chainConfig.color }}
                                        >
                                            {chainConfig.icon} {chainConfig.label}
                                        </div>
                                    </div>

                                    {/* Token Info */}
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold truncate">
                                                {pool.baseToken?.symbol || pool.symbol || 'TOKEN'}
                                            </span>
                                            {isVeryNew && (
                                                <Sparkles size={14} className="text-yellow-400" />
                                            )}
                                        </div>
                                        <div className="text-xs text-text-muted truncate">
                                            {pool.baseToken?.name || pool.name || 'Unknown'}
                                        </div>
                                    </div>

                                    {/* Price & Change */}
                                    <div className="mt-3 flex items-end justify-between">
                                        <div>
                                            <div className="text-lg font-bold">
                                                {formatPrice(pool.priceUSD)}
                                            </div>
                                            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {Math.abs(pool.priceChange24h || 0).toFixed(2)}%
                                            </div>
                                        </div>

                                        {/* Volume or Snipe Score */}
                                        <div className="text-right">
                                            {pool.snipeScore !== undefined ? (
                                                <div className={`px-2 py-1 rounded text-xs font-bold ${getSnipeScoreColor(pool.snipeScore)}`}>
                                                    Score {pool.snipeScore}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-xs text-text-muted">Vol 24h</div>
                                                    <div className="text-sm font-semibold">
                                                        {formatVolume(pool.volume24h)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Age indicator for new tokens */}
                                    {pool.ageFormatted && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
                                            <Clock size={12} />
                                            <span>{pool.ageFormatted} old</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
