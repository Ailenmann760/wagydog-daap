'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';

export default function TokenCard({ token, rank }) {
    const mainPair = token.pairs?.[0];
    const priceChange = mainPair?.priceChange24h || 0;
    const isPositive = priceChange >= 0;

    return (
        <Link
            href={`/token/${token.address}`}
            className="glass rounded-lg p-4 hover:bg-white/5 transition cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {token.logoUrl ? (
                        <img src={token.logoUrl} alt={token.symbol} className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold">
                            {token.symbol[0]}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold group-hover:text-primary transition">{token.symbol}</div>
                        <div className="text-xs text-text-muted">{token.name}</div>
                    </div>
                </div>
                {rank && (
                    <div className="text-primary font-bold text-sm">#{rank}</div>
                )}
            </div>

            {mainPair && (
                <>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold">${mainPair.priceUSD.toFixed(mainPair.priceUSD < 1 ? 6 : 2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                        </div>
                        <div className="text-text-muted">
                            Vol: ${(mainPair.volume24h / 1000).toFixed(1)}k
                        </div>
                    </div>
                </>
            )}

            {token.isFeatured && (
                <div className="mt-2 flex items-center gap-1 text-xs text-primary-accent">
                    <Star size={12} className="fill-current" />
                    Featured
                </div>
            )}
        </Link>
    );
}
