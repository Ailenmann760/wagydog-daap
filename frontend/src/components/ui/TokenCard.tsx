'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Star, Clock } from 'lucide-react';

// Chain logo URLs (using trusted CDN sources)
const CHAIN_LOGOS = {
    ethereum: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    bsc: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    solana: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
    base: 'https://images.mirror-media.xyz/publication-images/cgqxxPdUFBDjgKna_dDir.png',
    arbitrum: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
    polygon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    avalanche: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
};

// Common quote token logos
const QUOTE_LOGOS = {
    WETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    WBNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    SOL: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
    WSOL: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
    BUSD: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg',
    DAI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg',
};

// Chain colors
const CHAIN_COLORS = {
    ethereum: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    bsc: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    solana: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    base: { bg: 'bg-blue-600/20', text: 'text-blue-300', border: 'border-blue-600/30' },
    arbitrum: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

export default function TokenCard({ token, rank }) {
    // Handle both old and new data structures
    const baseToken = token.baseToken || token;
    const quoteToken = token.quoteToken || {};

    const symbol = baseToken.symbol || token.symbol || 'TOKEN';
    const name = baseToken.name || token.name || 'Unknown Token';
    const address = token.address || baseToken.address || '';
    const chain = token.chain || 'ethereum';
    const priceUSD = token.priceUSD || token.price || 0;
    const priceChange = token.priceChange24h || 0;
    const volume24h = token.volume24h || 0;
    const liquidity = token.liquidity || 0;
    const isPositive = priceChange >= 0;
    const chainColors = CHAIN_COLORS[chain] || CHAIN_COLORS.ethereum;
    const chainLogo = CHAIN_LOGOS[chain];
    const quoteLogo = QUOTE_LOGOS[quoteToken.symbol] || QUOTE_LOGOS.USDT;

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        if (price < 0.00000001) return `$${price.toExponential(2)}`;
        if (price < 0.0001) return `$${price.toFixed(8)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatVolume = (vol) => {
        if (!vol) return '$0';
        if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
        if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
        return `$${vol.toFixed(0)}`;
    };

    return (
        <Link
            href={`/token/${address}?chain=${chain}`}
            className={`glass-surface rounded-xl p-4 hover:bg-white/5 transition cursor-pointer group border ${chainColors.border}`}
        >
            {/* Header with token info */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Token logos - stacked */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center font-bold text-sm shadow-lg">
                            {symbol[0]}
                        </div>
                        {/* Chain badge */}
                        {chainLogo && (
                            <img
                                src={chainLogo}
                                alt={chain}
                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-bg-surface p-0.5 border border-bg"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold group-hover:text-primary transition">{symbol}</span>
                            {quoteToken.symbol && (
                                <span className="text-text-muted text-sm">/ {quoteToken.symbol}</span>
                            )}
                        </div>
                        <div className="text-xs text-text-muted truncate max-w-[120px]">{name}</div>
                    </div>
                </div>
                {rank && (
                    <div className="text-primary font-bold text-sm">#{rank}</div>
                )}
            </div>

            {/* Price info */}
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-lg font-bold">{formatPrice(priceUSD)}</span>
            </div>

            {/* Change and volume */}
            <div className="flex items-center justify-between text-sm">
                <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
                <div className="text-text-muted">
                    Vol: {formatVolume(volume24h)}
                </div>
            </div>

            {/* Chain badge and age */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${chainColors.bg} ${chainColors.text}`}>
                    {chain.toUpperCase()}
                </span>
                {token.ageFormatted && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={12} />
                        {token.ageFormatted}
                    </span>
                )}
            </div>
        </Link>
    );
}
