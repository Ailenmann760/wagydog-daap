'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';

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

// Chain colors for badges
const CHAIN_COLORS = {
    ethereum: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    bsc: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    solana: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    base: { bg: 'bg-blue-600/20', text: 'text-blue-300' },
    arbitrum: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
};

// DEX URLs
const DEX_URLS = {
    ethereum: 'https://app.uniswap.org/#/swap?outputCurrency=',
    bsc: 'https://pancakeswap.finance/swap?outputCurrency=',
    solana: 'https://raydium.io/swap/?outputCurrency=',
    base: 'https://app.uniswap.org/#/swap?chain=base&outputCurrency=',
    arbitrum: 'https://app.uniswap.org/#/swap?chain=arbitrum&outputCurrency=',
};

export default function PairTable({ pairs }) {
    const formatPrice = (price) => {
        if (!price) return '$0.00';
        if (price < 0.00000001) return `$${price.toExponential(2)}`;
        if (price < 0.0001) return `$${price.toFixed(8)}`;
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

    // Shared pair data extraction
    const getPairData = (pair) => {
        const baseToken = pair.baseToken || pair.tokenA || {};
        const quoteToken = pair.quoteToken || pair.tokenB || {};
        const baseSymbol = baseToken.symbol || 'TOKEN';
        const quoteSymbol = quoteToken.symbol || 'QUOTE';
        const chain = pair.chain || 'ethereum';
        const chainColors = CHAIN_COLORS[chain] || CHAIN_COLORS.ethereum;
        const isPositive = (pair.priceChange24h || 0) >= 0;
        const pairAddress = pair.address || pair.pairAddress;
        const tokenAddress = baseToken.address || pairAddress;
        const dexUrl = DEX_URLS[chain] || DEX_URLS.ethereum;
        const chainLogo = CHAIN_LOGOS[chain];
        const quoteLogo = QUOTE_LOGOS[quoteSymbol] || CHAIN_LOGOS[chain];

        return {
            baseToken, quoteToken, baseSymbol, quoteSymbol, chain,
            chainColors, isPositive, pairAddress, tokenAddress, dexUrl, chainLogo, quoteLogo
        };
    };

    return (
        <>
            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-3 p-3">
                {pairs.map((pair, index) => {
                    const { baseSymbol, quoteSymbol, chain, chainColors, isPositive, pairAddress, tokenAddress, dexUrl, quoteLogo } = getPairData(pair);

                    return (
                        <div key={pairAddress || index} className="bg-bg-surface/50 border border-border/50 rounded-xl p-4">
                            {/* Row 1: Pair name + Chain + Change */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {/* Token logos */}
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-bold border-2 border-bg-surface z-10">
                                            {baseSymbol[0]}
                                        </div>
                                        {quoteLogo ? (
                                            <img
                                                src={quoteLogo}
                                                alt={quoteSymbol}
                                                className="w-8 h-8 rounded-full border-2 border-bg-surface bg-bg-surface"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold border-2 border-bg-surface">
                                                {quoteSymbol[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Link
                                            href={`/token/${pairAddress}?chain=${chain}`}
                                            className="font-semibold text-sm"
                                        >
                                            {baseSymbol}/{quoteSymbol}
                                        </Link>
                                        <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${chainColors.bg} ${chainColors.text}`}>
                                            {chain.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {Math.abs(pair.priceChange24h || 0).toFixed(2)}%
                                </div>
                            </div>

                            {/* Row 2: Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div>
                                    <span className="text-text-muted block">Price</span>
                                    <span className="font-medium">{formatPrice(pair.priceUSD)}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block">Volume</span>
                                    <span className="font-medium">{formatVolume(pair.volume24h)}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block">Liquidity</span>
                                    <span className="font-medium">{formatVolume(pair.liquidity)}</span>
                                </div>
                            </div>

                            {/* Row 3: Action */}
                            <a
                                href={`${dexUrl}${tokenAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-sm font-medium transition"
                            >
                                Trade <ExternalLink size={14} />
                            </a>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-text-muted text-sm">
                            <th className="py-4 px-4 font-medium">Pair</th>
                            <th className="py-4 px-4 font-medium text-right">Price</th>
                            <th className="py-4 px-4 font-medium text-right">24h Change</th>
                            <th className="py-4 px-4 font-medium text-right">24h Volume</th>
                            <th className="py-4 px-4 font-medium text-right">Liquidity</th>
                            <th className="py-4 px-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pairs.map((pair, index) => {
                            const { baseSymbol, quoteSymbol, chain, chainColors, isPositive, pairAddress, tokenAddress, dexUrl, chainLogo, quoteLogo } = getPairData(pair);

                            return (
                                <tr
                                    key={pairAddress || index}
                                    className="border-b border-white/5 hover:bg-white/5 transition group"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-bold border-2 border-bg-surface z-10">
                                                    {baseSymbol[0]}
                                                </div>
                                                {quoteLogo ? (
                                                    <img
                                                        src={quoteLogo}
                                                        alt={quoteSymbol}
                                                        className="w-9 h-9 rounded-full border-2 border-bg-surface bg-bg-surface"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold border-2 border-bg-surface">
                                                        {quoteSymbol[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Link
                                                    href={`/token/${pairAddress}?chain=${chain}`}
                                                    className="font-semibold group-hover:text-primary transition"
                                                >
                                                    {baseSymbol}/{quoteSymbol}
                                                </Link>
                                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                                    {chainLogo && (
                                                        <img
                                                            src={chainLogo}
                                                            alt={chain}
                                                            className="w-4 h-4 rounded-full"
                                                        />
                                                    )}
                                                    <span className={`px-1.5 py-0.5 rounded ${chainColors.bg} ${chainColors.text}`}>
                                                        {chain.toUpperCase()}
                                                    </span>
                                                    {pair.dex && (
                                                        <span className="text-text-muted">{pair.dex}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right font-medium">
                                        {formatPrice(pair.priceUSD)}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className={`inline-flex items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
                                            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {Math.abs(pair.priceChange24h || 0).toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right text-text-muted">
                                        {formatVolume(pair.volume24h)}
                                    </td>
                                    <td className="py-4 px-4 text-right text-text-muted">
                                        {formatVolume(pair.liquidity)}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <a
                                            href={`${dexUrl}${tokenAddress}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-sm font-medium transition"
                                        >
                                            Trade <ExternalLink size={12} />
                                        </a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {pairs.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                    No pairs found
                </div>
            )}
        </>
    );
}
