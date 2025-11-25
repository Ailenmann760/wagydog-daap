'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TrendingUp } from 'lucide-react';
import TokenCard from '../ui/TokenCard';

export default function TrendingTokens() {
    const { data, isLoading } = useQuery({
        queryKey: ['trending'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/tokens/trending?limit=24`);
            return response.data.data;
        },
    });

    return (
        <section className="glass-surface rounded-surface p-6">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-primary" size={24} />
                <h2 className="text-2xl font-bold">🔥 Trending Tokens</h2>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-bg-surface rounded-lg animate-shimmer" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data?.map((item) => (
                        <TokenCard key={item.token.id} token={item.token} rank={item.rank} />
                    ))}
                </div>
            )}
        </section>
    );
}
