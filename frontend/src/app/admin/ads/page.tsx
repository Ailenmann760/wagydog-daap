'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Megaphone, TrendingUp, Image, Zap, ArrowLeft, Plus,
    Loader2, DollarSign, Clock, Eye, MousePointer
} from 'lucide-react';

// Ad pricing tiers
const AD_PRICING = {
    trendingSlot: {
        name: 'Trending Slot',
        description: 'Appear in the Trending section on homepage',
        prices: {
            '1d': { amount: 0.05, label: '1 Day', eth: '0.05 ETH' },
            '3d': { amount: 0.12, label: '3 Days', eth: '0.12 ETH' },
            '7d': { amount: 0.25, label: '7 Days', eth: '0.25 ETH' },
        },
        icon: TrendingUp,
    },
    bannerAd: {
        name: 'Banner Ad',
        description: 'Flash banner at the top of all pages',
        prices: {
            '1d': { amount: 0.08, label: '1 Day', eth: '0.08 ETH' },
            '3d': { amount: 0.20, label: '3 Days', eth: '0.20 ETH' },
            '7d': { amount: 0.40, label: '7 Days', eth: '0.40 ETH' },
        },
        icon: Image,
    },
    featuredToken: {
        name: 'Featured Token',
        description: 'Highlighted with a star badge in lists',
        prices: {
            '1d': { amount: 0.03, label: '1 Day', eth: '0.03 ETH' },
            '3d': { amount: 0.08, label: '3 Days', eth: '0.08 ETH' },
            '7d': { amount: 0.15, label: '7 Days', eth: '0.15 ETH' },
        },
        icon: Zap,
    },
};

// Mock active campaigns
const MOCK_CAMPAIGNS = [
    { id: '1', type: 'trendingSlot', tokenSymbol: 'PEPE', status: 'active', impressions: 12450, clicks: 234, expiresAt: '2024-12-25' },
    { id: '2', type: 'bannerAd', tokenSymbol: 'DOGE', status: 'active', impressions: 8920, clicks: 156, expiresAt: '2024-12-22' },
];

export default function AdminAdsPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAdType, setSelectedAdType] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setIsAuthenticated(true);
        setLoading(false);
    }, [router]);

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
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/dashboard"
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Megaphone className="text-primary" size={32} />
                        <h1 className="text-3xl font-bold">Ad Management</h1>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                    <Plus size={18} />
                    Create Campaign
                </button>
            </div>

            {/* Ad Types / Pricing */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Premium Advertising Options</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(AD_PRICING).map(([key, ad]) => {
                        const Icon = ad.icon;
                        return (
                            <div
                                key={key}
                                className="glass-surface rounded-xl p-6 border border-border hover:border-primary/50 transition cursor-pointer"
                                onClick={() => setSelectedAdType(key)}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-primary/20 rounded-lg">
                                        <Icon className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{ad.name}</h3>
                                        <p className="text-sm text-text-muted">{ad.description}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(ad.prices).map(([duration, price]) => (
                                        <div key={duration} className="flex justify-between text-sm">
                                            <span className="text-text-muted">{price.label}</span>
                                            <span className="font-semibold text-green-400">{price.eth}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Active Campaigns */}
            <div className="glass-surface rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Active Campaigns</h2>

                {MOCK_CAMPAIGNS.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left text-text-muted text-sm">
                                    <th className="pb-3 pr-4">Type</th>
                                    <th className="pb-3 pr-4">Token</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3 pr-4">Impressions</th>
                                    <th className="pb-3 pr-4">Clicks</th>
                                    <th className="pb-3 pr-4">CTR</th>
                                    <th className="pb-3">Expires</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_CAMPAIGNS.map(campaign => {
                                    const adType = AD_PRICING[campaign.type as keyof typeof AD_PRICING];
                                    const ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2);
                                    return (
                                        <tr key={campaign.id} className="border-b border-white/5">
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-2">
                                                    {adType && <adType.icon size={16} className="text-primary" />}
                                                    <span>{adType?.name || campaign.type}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4 font-semibold">{campaign.tokenSymbol}</td>
                                            <td className="py-4 pr-4">
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-1">
                                                    <Eye size={14} className="text-text-muted" />
                                                    {campaign.impressions.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-1">
                                                    <MousePointer size={14} className="text-text-muted" />
                                                    {campaign.clicks.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4 text-primary">{ctr}%</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-1 text-text-muted">
                                                    <Clock size={14} />
                                                    {campaign.expiresAt}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-muted">
                        <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No active campaigns</p>
                        <p className="text-sm mt-2">Create your first ad campaign to start promoting tokens</p>
                    </div>
                )}
            </div>

            {/* Revenue Stats */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="glass-surface rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                        <DollarSign size={20} />
                        <span className="text-sm text-text-muted">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold">0.85 ETH</div>
                    <div className="text-sm text-text-muted">≈ $3,200</div>
                </div>
                <div className="glass-surface rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <Eye size={20} />
                        <span className="text-sm text-text-muted">Total Impressions</span>
                    </div>
                    <div className="text-2xl font-bold">21,370</div>
                </div>
                <div className="glass-surface rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <MousePointer size={20} />
                        <span className="text-sm text-text-muted">Total Clicks</span>
                    </div>
                    <div className="text-2xl font-bold">390</div>
                    <div className="text-sm text-text-muted">1.83% CTR</div>
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass-surface rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Create Ad Campaign</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Token Address</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    className="w-full px-4 py-3 bg-bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Ad Type</label>
                                <div className="space-y-2">
                                    {Object.entries(AD_PRICING).map(([key, ad]) => (
                                        <label
                                            key={key}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedAdType === key
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="adType"
                                                value={key}
                                                checked={selectedAdType === key}
                                                onChange={() => setSelectedAdType(key)}
                                                className="hidden"
                                            />
                                            <ad.icon size={20} className="text-primary" />
                                            <div>
                                                <div className="font-medium">{ad.name}</div>
                                                <div className="text-xs text-text-muted">{ad.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedAdType && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Duration</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(AD_PRICING[selectedAdType as keyof typeof AD_PRICING].prices).map(([duration, price]) => (
                                            <button
                                                key={duration}
                                                className="p-3 border border-border rounded-lg hover:border-primary text-center transition"
                                            >
                                                <div className="font-medium">{price.label}</div>
                                                <div className="text-green-400 text-sm">{price.eth}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-3 bg-primary rounded-lg hover:bg-primary-dark transition font-semibold"
                            >
                                Pay with Crypto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
