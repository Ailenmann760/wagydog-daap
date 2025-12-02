'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ChainSelector from '@/components/ui/ChainSelector';
import PairTable from '@/components/market/PairTable';

export default function PairsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['pairs', 'trending'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/pairs/trending?limit=50`);
            return response.data.data;
        },
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">Pairs</h1>
                    <p className="text-text-muted mt-2">Discover new and trending trading pairs</p>
                </div>
                <ChainSelector />
            </div>

            <div className="glass-surface rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-lg animate-shimmer" />
                        ))}
                    </div>
                ) : (
                    <PairTable pairs={data || []} />
                )}
            </div>
        </div>
    );
}
