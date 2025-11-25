'use client';

import { Home, TrendingUp, Layers, Star, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

const navItems = [
    { href: '/', icon: Home, label: 'Overview' },
    { href: '/tokens', icon: TrendingUp, label: 'Tokens' },
    { href: '/pairs', icon: Layers, label: 'Pairs' },
    { href: '/watchlist', icon: Star, label: 'Watchlist' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={clsx(
                'hidden lg:flex flex-col glass-surface border-r border-border transition-all duration-300',
                collapsed ? 'w-20' : 'w-64'
            )}>
                <div className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium',
                                    isActive
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'hover:bg-white/5 text-text-muted hover:text-text'
                                )}
                            >
                                <Icon size={20} />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto p-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full px-4 py-2 hover:bg-white/5 rounded-lg transition text-text-muted text-sm"
                    >
                        {collapsed ? '→' : '←'} {!collapsed && 'Collapse'}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-surface border-t border-border z-50">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                    })}
                </div>
            </nav >
        </>
    );
}
