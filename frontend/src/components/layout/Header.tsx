'use client';

import { Menu, Search, Wallet } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 glass border-b border-border backdrop-blur-xl">
            <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition"
                    >
                        <Menu size={24} />
                    </button>

                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image
                                src="/wagydog-logo.png"
                                alt="Wagydog Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold hidden md:block">Wagydog</span>
                    </Link>
                </div>

                <div className="hidden md:block flex-1 max-w-xl">
                    <SearchBar />
                </div>

                <div className="flex items-center gap-3">
                    <button className="md:hidden p-2 hover:bg-white/5 rounded-lg transition">
                        <Search size={20} />
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-lg hover:opacity-90 transition font-semibold">
                        <Wallet size={18} />
                        <span className="hidden sm:inline">Connect</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
