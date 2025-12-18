'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
    Shield, TrendingUp, Users, BarChart, CheckCircle, XCircle,
    Megaphone, LogOut, Star, Loader2, Plus
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setIsAuthenticated(true);
        setLoading(false);
    }, [router]);

    const getAuthHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/admin/dashboard`, {
                headers: getAuthHeaders()
            });
            return response.data.data;
        },
        enabled: isAuthenticated,
    });

    const { data: pendingTokens } = useQuery({
        queryKey: ['pendingTokens'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/admin/tokens/pending`, {
                headers: getAuthHeaders()
            });
            return response.data.data;
        },
        enabled: isAuthenticated,
    });

    const approveMutation = useMutation({
        mutationFn: async (tokenId: string) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            await axios.post(`${apiUrl}/api/admin/tokens/${tokenId}/approve`, {}, {
                headers: getAuthHeaders()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingTokens'] });
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        },
    });

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Shield className="text-primary" size={32} />
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/ads"
                        className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary rounded-lg hover:bg-primary/30 transition"
                    >
                        <Megaphone size={18} />
                        Manage Ads
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-surface rounded-xl p-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <TrendingUp size={20} />
                        <span className="text-sm text-text-muted">Total Tokens</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.tokens?.total || 0}</div>
                    <div className="text-xs text-yellow-400 mt-1">{stats?.tokens?.pending || 0} pending</div>
                </div>

                <div className="glass-surface rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Star size={20} />
                        <span className="text-sm text-text-muted">Featured</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.tokens?.featured || 0}</div>
                </div>

                <div className="glass-surface rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Users size={20} />
                        <span className="text-sm text-text-muted">Users</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
                </div>

                <div className="glass-surface rounded-xl p-4">
                    <div className="flex items-center gap-2 text-cyan-400 mb-2">
                        <BarChart size={20} />
                        <span className="text-sm text-text-muted">Page Views Today</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.today?.pageViews || 0}</div>
                </div>
            </div>

            {/* Pending Approvals */}
            <div className="glass-surface rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Pending Token Approvals</h2>
                <div className="space-y-3">
                    {pendingTokens?.slice(0, 10).map((token: any) => (
                        <div key={token.id} className="flex items-center justify-between p-4 bg-bg-surface rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                                    {token.symbol?.[0] || '?'}
                                </div>
                                <div>
                                    <div className="font-semibold">{token.symbol}</div>
                                    <div className="text-sm text-text-muted">{token.name}</div>
                                    <div className="text-xs text-text-muted">{token.chain} • {token.address?.slice(0, 10)}...</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => approveMutation.mutate(token.id)}
                                    disabled={approveMutation.isPending}
                                    className="flex items-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                                <button
                                    className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition"
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}

                    {(!pendingTokens || pendingTokens.length === 0) && (
                        <div className="text-center text-text-muted py-8">
                            No pending approvals
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
