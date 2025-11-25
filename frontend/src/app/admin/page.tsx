'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Shield, TrendingUp, Users, BarChart, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
    const [token, setToken] = useState(null);

    const { data: stats } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            return response.data.data;
        },
    });

    const { data: pendingTokens } = useQuery({
        queryKey: ['pendingTokens'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await axios.get(`${apiUrl}/api/admin/tokens/pending`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            return response.data.data;
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Shield className="text-primary" size={32} />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <TrendingUp size={20} />
                        <span className="text-sm text-text-muted">Total Tokens</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.tokens.total || 0}</div>
                    <div className="text-xs text-text-muted mt-1">{stats?.tokens.pending || 0} pending</div>
                </div>

                <div className="glass-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 text-success mb-2">
                        <BarChart size={20} />
                        <span className="text-sm text-text-muted">Total Pairs</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.pairs.total || 0}</div>
                </div>

                <div className="glass-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 text-primary-accent mb-2">
                        <Users size={20} />
                        <span className="text-sm text-text-muted">Users</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
                </div>

                <div className="glass-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 text-warning mb-2">
                        <TrendingUp size={20} />
                        <span className="text-sm text-text-muted">Page Views Today</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.today.pageViews || 0}</div>
                </div>
            </div>

            {/* Pending Approvals */}
            <div className="glass-surface rounded-surface p-6">
                <h2 className="text-xl font-bold mb-4">Pending Token Approvals</h2>
                <div className="space-y-3">
                    {pendingTokens?.slice(0, 10).map((token) => (
                        <div key={token.id} className="flex items-center justify-between p-4 bg-bg-surface rounded-lg">
                            <div className="flex items-center gap-3">
                                {token.logoUrl && (
                                    <img src={token.logoUrl} alt={token.symbol} className="w-10 h-10 rounded-full" />
                                )}
                                <div>
                                    <div className="font-semibold">{token.symbol}</div>
                                    <div className="text-sm text-text-muted">{token.name}</div>
                                    <div className="text-xs text-text-muted">{token.chain} • {token.address.slice(0, 10)}...</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                                            await axios.post(`${apiUrl}/api/admin/tokens/${token.id}/approve`, {}, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                            });
                                            alert('Token approved!');
                                        } catch (error) {
                                            alert('Failed to approve token');
                                        }
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-success/20 text-success border border-success rounded-lg hover:bg-success/30 transition"
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                                            await axios.delete(`${apiUrl}/api/admin/tokens/${token.id}`, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                            });
                                            alert('Token rejected!');
                                        } catch (error) {
                                            alert('Failed to reject token');
                                        }
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-danger/20 text-danger border border-danger rounded-lg hover:bg-danger/30 transition"
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
