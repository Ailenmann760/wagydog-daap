'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PairTable({ pairs }) {
    return (
        <div className="overflow-x-auto">
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
                    {pairs.map((pair) => {
                        const isPositive = (pair.priceChange24h || 0) >= 0;
                        return (
                            <tr key={pair.id} className="border-b border-white/5 hover:bg-white/5 transition group">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {pair.tokenA?.logoUrl ? (
                                                <img src={pair.tokenA.logoUrl} className="w-8 h-8 rounded-full border-2 border-bg-surface" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold border-2 border-bg-surface">
                                                    {pair.tokenA?.symbol?.[0]}
                                                </div>
                                            )}
                                            {pair.tokenB?.logoUrl ? (
                                                <img src={pair.tokenB.logoUrl} className="w-8 h-8 rounded-full border-2 border-bg-surface" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border-2 border-bg-surface">
                                                    {pair.tokenB?.symbol?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold group-hover:text-primary transition">
                                                {pair.tokenA?.symbol}/{pair.tokenB?.symbol}
                                            </div>
                                            <div className="text-xs text-text-muted">{pair.dexName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right font-medium">
                                    ${pair.priceUSD?.toFixed(pair.priceUSD < 1 ? 6 : 2)}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className={`inline-flex items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
                                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(pair.priceChange24h || 0).toFixed(2)}%
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right text-text-muted">
                                    ${(pair.volume24h / 1000).toFixed(1)}k
                                </td>
                                <td className="py-4 px-4 text-right text-text-muted">
                                    ${(pair.liquidity / 1000).toFixed(1)}k
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <Link
                                        href={`/pair/${pair.pairAddress}`}
                                        className="inline-block px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition"
                                    >
                                        Trade
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
