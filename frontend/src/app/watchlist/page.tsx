export default function WatchlistPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">Watchlist</h1>
                    <p className="text-text-muted mt-2">Track your favorite tokens</p>
                </div>
            </div>

            <div className="glass-surface p-8 rounded-xl text-center">
                <p className="text-text-muted">Connect your wallet to view your watchlist.</p>
            </div>
        </div>
    );
}
