'use client';

import { TrendingUp, Activity, Zap, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsData {
    totalTokens: number;
    volume24h: string;
    trending: number;
    gainers: number;
}

export default function StatsBar() {
    const [stats, setStats] = useState<StatsData>({
        totalTokens: 0,
        volume24h: '$0',
        trending: 0,
        gainers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated stats - in production, fetch from API
        setTimeout(() => {
            setStats({
                totalTokens: 12847,
                volume24h: '$2.4B',
                trending: 24,
                gainers: 156,
            });
            setLoading(false);
        }, 500);
    }, []);

    const statsItems = [
        {
            icon: Activity,
            label: 'Total Tokens',
            value: loading ? '---' : stats.totalTokens.toLocaleString(),
            color: 'text-primary',
        },
        {
            icon: DollarSign,
            label: '24h Volume',
            value: loading ? '---' : stats.volume24h,
            color: 'text-success',
        },
        {
            icon: TrendingUp,
            label: 'Trending',
            value: loading ? '---' : stats.trending,
            color: 'text-warning',
        },
        {
            icon: Zap,
            label: 'Top Gainers',
            value: loading ? '---' : stats.gainers,
            color: 'text-primary-accent',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsItems.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="glass-surface rounded-2xl p-4 hover:bg-bg-highlight transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-bg-alt ${stat.color}`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="text-text-muted text-sm">{stat.label}</p>
                                <p className="text-xl font-bold mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
