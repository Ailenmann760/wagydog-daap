import TrendingTokens from '@/components/market/TrendingTokens';
import NewPairs from '@/components/market/NewPairs';
import TopMovers from '@/components/market/TopMovers';
import ChainSelector from '@/components/ui/ChainSelector';
import StatsBar from '@/components/ui/StatsBar';

export default async function HomePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">Market Overview</h1>
                    <p className="text-text-muted mt-2">Real-time crypto analytics across all chains</p>
                </div>
                <ChainSelector />
            </div>

            {/* Stats Bar */}
            <StatsBar />

            {/* Market Sections */}
            <div className="grid gap-8">
                <TrendingTokens />
                <TopMovers />
                <NewPairs />
            </div>
        </div>
    );
}
