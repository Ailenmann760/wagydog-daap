import TrendingTokens from '../components/market/TrendingTokens';
import NewTokensLive from '../components/market/NewTokensLive';
import ChainSelector from '../components/ui/ChainSelector';
import StatsBar from '../components/ui/StatsBar';
import { Zap, TrendingUp, Sparkles } from 'lucide-react';

export default async function HomePage() {
    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-surface p-8 glass-card">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-glow opacity-50" />

                <div className="relative flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="text-yellow-400" size={32} />
                            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Wagydog Analytics
                            </h1>
                        </div>
                        <p className="text-text-muted text-lg max-w-2xl">
                            Real-time crypto analytics across all chains. Discover new tokens seconds after launch,
                            track trending pairs, and never miss another opportunity.
                        </p>

                        {/* Feature badges */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                                <Sparkles size={14} />
                                New Token Alerts
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                                <TrendingUp size={14} />
                                Live Charts
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                                ⚡ Multi-Chain
                            </span>
                        </div>
                    </div>
                    <ChainSelector />
                </div>
            </div>

            {/* Stats Bar */}
            <StatsBar />

            {/* New Tokens Section - Featured */}
            <NewTokensLive limit={20} />

            {/* Trending Tokens */}
            <TrendingTokens limit={24} />
        </div>
    );
}
