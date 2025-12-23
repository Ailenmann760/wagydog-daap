'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ChainSelector from '../../components/ui/ChainSelector';
import PairTable from '../../components/market/PairTable';

export default function PairsPage() {
    const [selectedChain, setSelectedChain] = useState(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['pairs', 'trending', selectedChain],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const chainParam = selectedChain ? `&chain=${selectedChain}` : '';
            const response = await axios.get(`${apiUrl}/api/pairs/trending?limit=50${chainParam}`);
            return response.data.data;
        },
    });

    return (
        <div className="space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Pairs</h1>
                    <p className="text-text-muted mt-1 text-sm sm:text-base">Discover new and trending trading pairs</p>
                </div>
                <ChainSelector
                    selectedChain={selectedChain}
                    onChainChange={setSelectedChain}
                />
            </div>

            {/* Table/Cards */}
            <div className="glass-surface rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-20 sm:h-16 bg-white/5 rounded-lg animate-shimmer" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-6 sm:p-8 text-center text-red-400">
                        Failed to load pairs. Please try again.
                    </div>
                ) : (
                    <PairTable pairs={data || []} />
                )}
            </div>
        </div>
    );
}
