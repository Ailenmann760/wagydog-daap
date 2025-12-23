'use client';

import { Home, TrendingUp, Layers, Star, BarChart3, X, Flame, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const navItems = [
    { href: '/', icon: Home, label: 'Overview' },
    { href: '/tokens', icon: TrendingUp, label: 'Tokens' },
    { href: '/pairs', icon: Layers, label: 'Pairs' },
    { href: '/degen', icon: Flame, label: 'Degen Tool' },
    { href: '/watchlist', icon: Star, label: 'Watchlist' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/donate', icon: Heart, label: 'Donate' },
];

// Create a global state for mobile menu
let mobileMenuListeners: ((open: boolean) => void)[] = [];
export function toggleMobileMenu(open: boolean) {
    mobileMenuListeners.forEach(fn => fn(open));
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Listen for mobile menu toggle from Header
    useEffect(() => {
        const listener = (open: boolean) => setMobileMenuOpen(open);
        mobileMenuListeners.push(listener);
        return () => {
            mobileMenuListeners = mobileMenuListeners.filter(fn => fn !== listener);
        };
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

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

            {/* Mobile Slide-out Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <aside className="absolute left-0 top-0 bottom-0 w-72 glass-surface border-r border-border animate-slide-in">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <span className="text-xl font-bold">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={clsx(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium',
                                            isActive
                                                ? 'bg-primary/20 text-primary border border-primary/30'
                                                : 'hover:bg-white/5 text-text-muted hover:text-text'
                                        )}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </aside>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-surface border-t border-border z-40 pb-safe">
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition min-w-[60px]',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-text-muted hover:text-text'
                                )}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
