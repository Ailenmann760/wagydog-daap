'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewPairs() {
    const { data, isLoading } = useQuery({
        queryKey: ['newPairs'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/tokens/new?limit=10`);
            return response.data.data;
        },
    });

    return (
        <section className="glass-surface rounded-surface p-6">
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-primary-accent" size={24} />
                <h2 className="text-2xl font-bold">✨ New Pairs</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-text-muted text-sm border-b border-border">
                            <th className="pb-3">Token</th>
                            <th className="pb-3">Price</th>
                            <th className="pb-3">24h %</th>
                            <th className="pb-3">Liquidity</th>
                            <th className="pb-3">Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((token) => {
                            const pair = token.pairs?.[0];
                            return (
                                <tr key={token.id} className="border-b border-border/50 hover:bg-white/5 transition">
                                    <td className="py-3">
                                        <Link href={`/token/${token.address}`} className="flex items-center gap-2">
                                            {token.logoUrl && <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />}
                                            <div>
                                                <div className="font-semibold">{token.symbol}</div>
                                                <div className="text-xs text-text-muted">{token.chain}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="py-3 font-semibold">${pair?.priceUSD.toFixed(4) || 'N/A'}</td>
                                    <td className={`py-3 font-semibold ${pair?.priceChange24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {pair?.priceChange24h >= 0 ? '+' : ''}{pair?.priceChange24h.toFixed(2)}%
                                    </td>
                                    <td className="py-3 text-text-muted">${(pair?.liquidity / 1000).toFixed(1)}k</td>
                                    <td className="py-3 text-text-muted">${(pair?.volume24h / 1000).toFixed(1)}k</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
