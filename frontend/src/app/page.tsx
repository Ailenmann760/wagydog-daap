import TrendingTokens from '../components/market/TrendingTokens';
import NewTokensLive from '../components/market/NewTokensLive';
import ChainSelector from '../components/ui/ChainSelector';
import StatsBar from '../components/ui/StatsBar';
import TokenLaunchCountdown from '../components/ui/TokenLaunchCountdown';
import { Zap, TrendingUp, Sparkles } from 'lucide-react';

export default async function HomePage() {
    return (
        <div className="space-y-6 p-4 lg:p-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 glass-card">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-glow opacity-50" />

                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="text-yellow-400" size={32} />
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Wagydog
                            </h1>
                        </div>
                        <p className="text-text-muted text-base lg:text-lg max-w-xl">
                            Real-time crypto analytics across all chains. Discover new tokens seconds after launch,
                            track trending pairs, and never miss another opportunity.
                        </p>

                        {/* Feature badges */}
                        <div className="flex flex-wrap gap-2 mt-4">
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
                    <div className="w-full lg:w-auto">
                        <ChainSelector />
                    </div>
                </div>
            </div>

            {/* Token Launch Countdown */}
            <TokenLaunchCountdown />

            {/* Stats Bar */}
            <StatsBar />

            {/* New Tokens Section - Featured */}
            <NewTokensLive limit={20} />

            {/* Trending Tokens */}
            <TrendingTokens limit={24} />
        </div>
    );
}

