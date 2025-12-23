'use client';

import { Menu, Search, Wallet, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import SearchBar from '../ui/SearchBar';
import { toggleMobileMenu } from './Sidebar';

export default function Header() {
    const [showWalletModal, setShowWalletModal] = useState(false);

    // Wagmi hooks
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const handleConnectWallet = (connector: any) => {
        connect({ connector });
        setShowWalletModal(false);
    };

    // Wallet Modal with better mobile support
    const WalletModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowWalletModal(false)}>
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
                <p className="text-slate-400 text-sm mb-6">Choose your preferred wallet</p>

                <div className="space-y-3">
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            onClick={() => handleConnectWallet(connector)}
                            disabled={isPending}
                            className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700 hover:border-blue-500/50 disabled:opacity-50"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                {connector.name === 'MetaMask' && <span className="text-2xl">🦊</span>}
                                {connector.name === 'WalletConnect' && <span className="text-2xl">🔗</span>}
                                {connector.name === 'Injected' && <span className="text-2xl">💼</span>}
                                {!['MetaMask', 'WalletConnect', 'Injected'].includes(connector.name) && <span className="text-2xl">👛</span>}
                            </div>
                            <div className="text-left">
                                <span className="text-white font-semibold block">
                                    {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
                                </span>
                                <span className="text-slate-400 text-xs">
                                    {connector.name === 'MetaMask' && 'Popular browser extension'}
                                    {connector.name === 'WalletConnect' && 'Trust Wallet, Binance & more'}
                                    {connector.name === 'Injected' && 'Use your browser wallet'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowWalletModal(false)}
                    className="mt-6 w-full py-3 text-slate-400 hover:text-white transition border border-slate-700 rounded-xl hover:border-slate-600"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <>
            <header className="sticky top-0 z-40 glass border-b border-border backdrop-blur-xl">
                <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => toggleMobileMenu(true)}
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
                        {isConnected ? (
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline text-sm text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </span>
                                <button
                                    onClick={() => disconnect()}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition font-semibold"
                                >
                                    <Wallet size={18} />
                                    <span className="hidden sm:inline">Disconnect</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowWalletModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-lg hover:opacity-90 transition font-semibold"
                            >
                                <Wallet size={18} />
                                <span className="hidden sm:inline">Connect</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar - Always visible on mobile */}
                <div className="md:hidden px-4 pb-3">
                    <SearchBar />
                </div>
            </header>

            {showWalletModal && <WalletModal />}
        </>
    );
}

