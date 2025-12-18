'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Star, Copy, Check, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import LiveChart from '../../../components/charts/LiveChart';

// Chain explorer URLs
const EXPLORERS = {
    ethereum: 'https://etherscan.io/token/',
    bsc: 'https://bscscan.com/token/',
    solana: 'https://solscan.io/token/',
    base: 'https://basescan.org/token/',
    arbitrum: 'https://arbiscan.io/token/',
};

// DEX URLs for trading
const DEX_URLS = {
    ethereum: 'https://app.uniswap.org/#/swap?outputCurrency=',
    bsc: 'https://pancakeswap.finance/swap?outputCurrency=',
    solana: 'https://raydium.io/swap/?outputCurrency=',
    base: 'https://app.uniswap.org/#/swap?chain=base&outputCurrency=',
    arbitrum: 'https://app.uniswap.org/#/swap?chain=arbitrum&outputCurrency=',
};

export default function TokenPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const address = params?.address as string;
    const chain = (searchParams?.get('chain') || 'ethereum') as string;

    const [copied, setCopied] = useState(false);

    // Fetch pool/token details from GeckoTerminal
    const { data, isLoading, error } = useQuery({
        queryKey: ['pool', address, chain],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            // Try getting pool details first
            const response = await axios.get(`${apiUrl}/api/pairs/${chain}/${address}`);
            return response.data.data;
        },
        enabled: !!address,
        retry: 1,
    });

    const copyAddress = async (addr: string) => {
        try {
            await navigator.clipboard.writeText(addr);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatPrice = (price: number | undefined) => {
        if (!price) return '$0.00';
        if (price < 0.00000001) return `$${price.toExponential(2)}`;
        if (price < 0.0001) return `$${price.toFixed(8)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatNumber = (num: number | undefined) => {
        if (!num) return 'N/A';
        if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    const getTradeUrl = () => {
        const baseUrl = DEX_URLS[chain] || DEX_URLS.ethereum;
        const tokenAddress = data?.baseToken?.address || address;
        return baseUrl + tokenAddress;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                    <span className="text-text-muted">Loading token data...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-6">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Failed to load token data</p>
                    <p className="text-text-muted text-sm mb-4">The pool may not exist or the API is unavailable</p>
                    <Link href="/" className="text-primary hover:underline">
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const token = data;
    const priceChange24h = token?.priceChange24h || 0;
    const priceChange1h = token?.priceChange1h || 0;
    const isPositive = priceChange24h >= 0;
    const tokenSymbol = token?.baseToken?.symbol || token?.symbol || 'TOKEN';
    const tokenName = token?.baseToken?.name || token?.name || 'Unknown Token';
    const quoteSymbol = token?.quoteToken?.symbol || 'USD';

    return (
        <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text transition">
                <ArrowLeft size={20} />
                Back to markets
            </Link>

            {/* Token Header */}
            <div className="glass-surface rounded-2xl p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        {/* Token Logo Placeholder */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl font-bold shadow-lg">
                            {tokenSymbol[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">{tokenSymbol}</h1>
                                <span className="text-text-muted">/ {quoteSymbol}</span>
                            </div>
                            <p className="text-text-muted">{tokenName}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded font-medium capitalize">
                                    {chain}
                                </span>
                                {token?.dex && (
                                    <span className="px-2 py-0.5 bg-white/10 text-text-muted text-xs rounded">
                                        {token.dex}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => copyAddress(token?.baseToken?.address || address)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition"
                        >
                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary rounded-lg hover:bg-primary/30 transition">
                            <Star size={18} />
                            Watch
                        </button>
                        <a
                            href={getTradeUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:opacity-90 transition font-semibold"
                        >
                            Trade
                        </a>
                    </div>
                </div>

                {/* Price Display */}
                <div className="mt-6 flex flex-wrap items-end gap-6">
                    <div>
                        <div className="text-4xl font-bold">{formatPrice(token?.priceUSD)}</div>
                    </div>
                    <div className="flex gap-4">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="font-medium">{priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)</span>
                        </div>
                        {priceChange1h !== undefined && (
                            <div className={`flex items-center gap-1 text-sm ${priceChange1h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {priceChange1h >= 0 ? '+' : ''}{priceChange1h.toFixed(2)}% (1h)
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">Liquidity</div>
                    <div className="text-xl font-bold">{formatNumber(token?.liquidity)}</div>
                </div>
                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">24h Volume</div>
                    <div className="text-xl font-bold">{formatNumber(token?.volume24h)}</div>
                </div>
                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">FDV</div>
                    <div className="text-xl font-bold">{formatNumber(token?.fdv)}</div>
                </div>
                <div className="glass-surface rounded-xl p-4">
                    <div className="text-text-muted text-sm mb-1">Market Cap</div>
                    <div className="text-xl font-bold">{formatNumber(token?.marketCap || token?.fdv)}</div>
                </div>
            </div>

            {/* Transactions */}
            {token?.txns24h && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-surface rounded-xl p-4">
                        <div className="text-text-muted text-sm mb-1">24h Buys</div>
                        <div className="text-xl font-bold text-green-400">{token.txns24h.buys || 0}</div>
                    </div>
                    <div className="glass-surface rounded-xl p-4">
                        <div className="text-text-muted text-sm mb-1">24h Sells</div>
                        <div className="text-xl font-bold text-red-400">{token.txns24h.sells || 0}</div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <LiveChart chain={chain} pairAddress={address} height={450} />

            {/* Token Details */}
            <div className="glass-surface rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Pool Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted">Pool Address</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">
                                    {address?.slice(0, 8)}...{address?.slice(-6)}
                                </span>
                                <button
                                    onClick={() => copyAddress(address)}
                                    className="p-1 hover:bg-white/10 rounded"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        {token?.baseToken?.address && (
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted">Token Address</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">
                                        {token.baseToken.address.slice(0, 8)}...{token.baseToken.address.slice(-6)}
                                    </span>
                                    <button
                                        onClick={() => copyAddress(token.baseToken.address)}
                                        className="p-1 hover:bg-white/10 rounded"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-text-muted">Chain</span>
                            <span className="capitalize font-medium">{chain}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-text-muted">DEX</span>
                            <span>{token?.dex || 'Unknown'}</span>
                        </div>

                        {token?.ageFormatted && (
                            <div className="flex justify-between">
                                <span className="text-text-muted">Pool Age</span>
                                <span>{token.ageFormatted}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {token?.url && (
                            <a
                                href={token.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
                            >
                                <span>View on GeckoTerminal</span>
                                <ExternalLink size={16} />
                            </a>
                        )}

                        {EXPLORERS[chain] && (
                            <a
                                href={`${EXPLORERS[chain]}${token?.baseToken?.address || address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
                            >
                                <span>View on Explorer</span>
                                <ExternalLink size={16} />
                            </a>
                        )}

                        <a
                            href={getTradeUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition"
                        >
                            <span>Trade on DEX</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
