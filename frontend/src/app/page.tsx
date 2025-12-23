import TrendingTokens from '../components/market/TrendingTokens';
import NewTokensLive from '../components/market/NewTokensLive';
import ChainSelector from '../components/ui/ChainSelector';
import StatsBar from '../components/ui/StatsBar';
import FairlaunchBanner from '../components/ui/FairlaunchBanner';
import PresaleWidget from '../components/ui/PresaleWidget';
import Image from 'next/image';

export default async function HomePage() {
    return (
        <div className="space-y-6 p-4 lg:p-6">
            {/* Hero Section - Professional & Clean */}
            <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 glass-card">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-glow opacity-50" />

                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                                <Image
                                    src="/wagydog-logo.png"
                                    alt="Wagydog"
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                />
                            </div>
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
                            <span className="px-4 py-1.5 bg-yellow-500/15 text-yellow-400 rounded-full text-sm font-medium border border-yellow-500/30">
                                New Token Alerts
                            </span>
                            <span className="px-4 py-1.5 bg-green-500/15 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                                Live Charts
                            </span>
                            <span className="px-4 py-1.5 bg-purple-500/15 text-purple-400 rounded-full text-sm font-medium border border-purple-500/30">
                                Multi-Chain
                            </span>
                        </div>
                    </div>
                    <div className="w-full lg:w-auto">
                        <ChainSelector />
                    </div>
                </div>
            </div>

            {/* Animated Fairlaunch Banner */}
            <FairlaunchBanner />

            {/* Presale Widget */}
            <PresaleWidget />

            {/* Stats Bar */}
            <StatsBar />

            {/* New Tokens Section - Featured */}
            <NewTokensLive limit={20} />

            {/* Trending Tokens */}
            <TrendingTokens limit={24} />
        </div>
    );
}
