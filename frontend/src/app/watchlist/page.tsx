'use client';

import { useAccount } from 'wagmi';
import { Star, Wallet } from 'lucide-react';

export default function WatchlistPage() {
    const { isConnected } = useAccount();

    return (
        <div className="space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Watchlist</h1>
                <p className="text-text-muted mt-1 text-sm sm:text-base">Track your favorite tokens</p>
            </div>

            {/* Content */}
            <div className="glass-surface p-6 sm:p-8 rounded-xl text-center">
                <div className="flex flex-col items-center gap-4">
                    {isConnected ? (
                        <>
                            <Star size={48} className="text-yellow-400 opacity-50" />
                            <div>
                                <p className="text-text-muted mb-2">Your watchlist is empty</p>
                                <p className="text-sm text-text-muted">
                                    Click the star icon on any token to add it to your watchlist
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Wallet size={48} className="text-primary opacity-50" />
                            <div>
                                <p className="text-text-muted mb-2">Connect your wallet to view your watchlist</p>
                                <p className="text-sm text-text-muted">
                                    Your watchlist will be synced across devices
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
