'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Star, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import LiveChart from '../../../components/charts/LiveChart';

export default function TokenPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const address = params?.address as string;
    const chain = searchParams?.get('chain') || 'ethereum';

    const [copied, setCopied] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['token', address, chain],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/tokens/${address}?chain=${chain}`);
            return response.data.data;
        },
        enabled: !!address,
    });

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatPrice = (price: number | undefined) => {
        if (!price) return '$0.00';
        if (price < 0.00001) return `$${price.toExponential(2)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatNumber = (num: number | undefined, suffix = '') => {
        if (!num) return 'N/A';
        if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B${suffix}`;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M${suffix}`;
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K${suffix}`;
        return `$${num.toFixed(0)}${suffix}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                    <span className="text-text-muted">Loading token data...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Failed to load token data</p>
                    <Link href="/" className="text-primary hover:underline">
                        Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const token = data;
    const priceChange = token?.priceChange24h || 0;

    return (
        <div className="space-y-6 p-4 lg:p-6">
            <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-text transition">
                <ArrowLeft size={20} />
                Back to markets
            </Link>

            {/* Token Header */}
            <div className="glass-surface rounded-2xl p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center text-2xl font-bold">
                            {token?.symbol?.[0] || '?'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {token?.name || token?.baseToken?.name || 'Unknown Token'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-text-muted">
                                    {token?.symbol || token?.baseToken?.symbol || 'TOKEN'}
                                </span>
                                <span className="px-2 py-1 bg-bg-surface rounded text-xs capitalize">{chain}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={copyAddress}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition"
                        >
                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy Address'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary rounded-lg hover:bg-primary/30 transition">
                            <Star size={18} />
                            Watchlist
                        </button>
                    </div>
                </div>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">Price</div>
                    <div className="text-2xl font-bold">{formatPrice(token?.priceUSD)}</div>
                    <div className={`text-sm ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange?.toFixed(2) || '0.00'}%
                    </div>
                </div>

                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">Liquidity</div>
                    <div className="text-2xl font-bold">{formatNumber(token?.liquidity)}</div>
                </div>

                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">24h Volume</div>
                    <div className="text-2xl font-bold">{formatNumber(token?.volume24h)}</div>
                </div>

                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">Market Cap</div>
                    <div className="text-2xl font-bold">{formatNumber(token?.marketCap || token?.fdv)}</div>
                </div>
            </div>

            {/* Chart */}
            <LiveChart chain={chain} pairAddress={address} height={400} />

            {/* Token Info */}
            <div className="glass-surface rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Token Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-text-muted">Contract</span>
                            <span className="font-mono text-sm">
                                {address?.slice(0, 10)}...{address?.slice(-8)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Chain</span>
                            <span className="capitalize">{chain}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">DEX</span>
                            <span>{token?.dex || 'Unknown'}</span>
                        </div>
                        {token?.ageFormatted && (
                            <div className="flex justify-between">
                                <span className="text-text-muted">Age</span>
                                <span>{token.ageFormatted}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {token?.url && (
                            <div className="flex justify-between">
                                <span className="text-text-muted">View on GeckoTerminal</span>
                                <a
                                    href={token.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:underline"
                                >
                                    View <ExternalLink size={14} />
                                </a>
                            </div>
                        )}
                        {token?.snipeScore !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-text-muted">Snipe Score</span>
                                <span className={`font-bold ${token.snipeScore >= 80 ? 'text-green-400' :
                                        token.snipeScore >= 60 ? 'text-yellow-400' :
                                            token.snipeScore >= 40 ? 'text-orange-400' : 'text-red-400'
                                    }`}>
                                    {token.snipeScore}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
