'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function TokenPage({ params }) {
    const { address } = use(params);

    const { data, isLoading } = useQuery({
        queryKey: ['token', address],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/tokens/${address}`);
            return response.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    const token = data;
    const mainPair = token?.pairs?.[0];

    return (
        <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-text transition">
                <ArrowLeft size={20} />
                Back to markets
            </Link>

            {/* Token Header */}
            <div className="glass-surface rounded-surface p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        {token?.logoUrl && (
                            <img src={token.logoUrl} alt={token.symbol} className="w-16 h-16 rounded-full" />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">{token?.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-text-muted">{token?.symbol}</span>
                                <span className="px-2 py-1 bg-bg-surface rounded text-xs">{token?.chain}</span>
                                {token?.isFeatured && (
                                    <Star size={16} className="text-primary-accent fill-current" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary rounded-lg hover:bg-primary/30 transition">
                            <Star size={18} />
                            Watchlist
                        </button>
                        <button className="px-6 py-2 bg-gradient-primary rounded-lg hover:opacity-90 transition font-semibold">
                            Trade
                        </button>
                    </div>
                </div>
            </div>

            {/* Price Stats */}
            {mainPair && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-surface rounded-lg p-4">
                        <div className="text-text-muted text-sm mb-1">Price</div>
                        <div className="text-2xl font-bold">${mainPair.priceUSD.toFixed(6)}</div>
                        <div className={`text-sm ${mainPair.priceChange24h >= 0 ? 'text-success' : 'text-danger'}`}>
                            {mainPair.priceChange24h >= 0 ? '+' : ''}{mainPair.priceChange24h.toFixed(2)}%
                        </div>
                    </div>

                    <div className="glass-surface rounded-lg p-4">
                        <div className="text-text-muted text-sm mb-1">Liquidity</div>
                        <div className="text-2xl font-bold">${(mainPair.liquidity / 1000).toFixed(1)}k</div>
                    </div>

                    <div className="glass-surface rounded-lg p-4">
                        <div className="text-text-muted text-sm mb-1">24h Volume</div>
                        <div className="text-2xl font-bold">${(mainPair.volume24h / 1000).toFixed(1)}k</div>
                    </div>

                    <div className="glass-surface rounded-lg p-4">
                        <div className="text-text-muted text-sm mb-1">Market Cap</div>
                        <div className="text-2xl font-bold">${token.marketCap ? (token.marketCap / 1000000).toFixed(2) + 'M' : 'N/A'}</div>
                    </div>
                </div>
            )}

            {/* Token Info */}
            <div className="glass-surface rounded-surface p-6">
                <h2 className="text-xl font-bold mb-4">Token Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Contract</span>
                                <span className="font-mono text-sm">{token?.address.slice(0, 10)}...{token?.address.slice(-8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Chain</span>
                                <span className="capitalize">{token?.chain}</span>
                            </div>
                            {token?.website && (
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Website</span>
                                    <a href={token.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                        Visit <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {token?.description && (
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-text-muted text-sm">{token.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pairs */}
            {token?.pairs && token.pairs.length > 0 && (
                <div className="glass-surface rounded-surface p-6">
                    <h2 className="text-xl font-bold mb-4">Trading Pairs</h2>
                    <div className="space-y-2">
                        {token.pairs.map((pair) => (
                            <div key={pair.id} className="flex items-center justify-between p-3 bg-bg-surface rounded-lg hover:bg-white/5 transition">
                                <div>
                                    <div className="font-semibold">{pair.tokenA.symbol}/{pair.tokenB.symbol}</div>
                                    <div className="text-sm text-text-muted">{pair.dexName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">${pair.priceUSD.toFixed(6)}</div>
                                    <div className={`text-sm ${pair.priceChange24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {pair.priceChange24h >= 0 ? '+' : ''}{pair.priceChange24h.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
