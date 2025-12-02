'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ChainSelector from '@/components/ui/ChainSelector';
import TokenCard from '@/components/ui/TokenCard';
import clsx from 'clsx';

const TABS = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'new', label: 'New Pairs', icon: Sparkles },
    { id: 'gainers', label: 'Top Gainers', icon: ArrowUpRight },
    { id: 'losers', label: 'Top Losers', icon: ArrowDownRight },
];

export default function TokensPage() {
    const [activeTab, setActiveTab] = useState('trending');

    const { data, isLoading } = useQuery({
        queryKey: ['tokens', activeTab],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            let endpoint = '/api/tokens/trending';

            switch (activeTab) {
                case 'new':
                    endpoint = '/api/tokens/new';
                    break;
                case 'gainers':
                    endpoint = '/api/tokens/lists/gainers';
                    break;
                case 'losers':
                    endpoint = '/api/tokens/lists/losers';
                    break;
            }

            const response = await axios.get(`${apiUrl}${endpoint}?limit=24`);
            return response.data.data;
        },
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">Tokens</h1>
                    <p className="text-text-muted mt-2">Explore top tokens across all chains</p>
                </div>
                <ChainSelector />
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap',
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text'
                            )}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-32 bg-bg-surface rounded-lg animate-shimmer" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data?.map((item) => {
                        // Handle different data structures from different endpoints
                        const token = item.token || item;
                        const rank = item.rank;
                        return <TokenCard key={token.id} token={token} rank={rank} />;
                    })}
                </div>
            )}
        </div>
    );
}
