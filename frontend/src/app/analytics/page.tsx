'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart3, Layers, DollarSign, Activity } from 'lucide-react';
import ChainSelector from '@/components/ui/ChainSelector';

export default function AnalyticsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/analytics/overview`);
            return response.data.data;
        },
    });

    const stats = [
        { label: 'Total Tokens', value: data?.totalTokens, icon: Activity, color: 'text-blue-400' },
        { label: 'Total Pairs', value: data?.totalPairs, icon: Layers, color: 'text-purple-400' },
        { label: '24h Volume', value: data ? `$${(data.total24hVolume / 1000000).toFixed(2)}M` : null, icon: BarChart3, color: 'text-green-400' },
        { label: 'Total Liquidity', value: data ? `$${(data.totalLiquidity / 1000000).toFixed(2)}M` : null, icon: DollarSign, color: 'text-yellow-400' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">Analytics</h1>
                    <p className="text-text-muted mt-2">Deep dive into market data</p>
                </div>
                <ChainSelector />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-surface p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                            <div className="text-text-muted text-sm">{stat.label}</div>
                            {isLoading ? (
                                <div className="h-8 w-24 bg-white/10 rounded mt-1 animate-shimmer" />
                            ) : (
                                <div className="text-2xl font-bold mt-1">{stat.value || 0}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="glass-surface p-8 rounded-xl text-center">
                <p className="text-text-muted">More detailed charts coming soon...</p>
            </div>
        </div>
    );
}
