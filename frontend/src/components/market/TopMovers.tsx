'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Flame } from 'lucide-react';
import TokenCard from '../ui/TokenCard';

export default function TopMovers() {
    const { data: gainers } = useQuery({
        queryKey: ['gainers'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/tokens/lists/gainers?limit=10`);
            return response.data.data;
        },
    });

    const { data: losers } = useQuery({
        queryKey: ['losers'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/tokens/lists/losers?limit=10`);
            return response.data.data;
        },
    });

    return (
        <section className="grid lg:grid-cols-2 gap-6">
            <div className="glass-surface rounded-surface p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Flame className="text-success" size={24} />
                    <h2 className="text-2xl font-bold">🚀 Top Gainers</h2>
                </div>
                <div className="grid gap-3">
                    {gainers?.slice(0, 5).map((token) => (
                        <TokenCard key={token.id} token={token} />
                    ))}
                </div>
            </div>

            <div className="glass-surface rounded-surface p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Flame className="text-danger" size={24} />
                    <h2 className="text-2xl font-bold">📉 Top Losers</h2>
                </div>
                <div className="grid gap-3">
                    {losers?.slice(0, 5).map((token) => (
                        <TokenCard key={token.id} token={token} />
                    ))}
                </div>
            </div>
        </section>
    );
}
