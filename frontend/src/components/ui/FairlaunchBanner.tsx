'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function FairlaunchBanner() {
    const [scrollPosition, setScrollPosition] = useState(0);

    // Animate the marquee text
    useEffect(() => {
        const interval = setInterval(() => {
            setScrollPosition(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fairlaunch-banner relative overflow-hidden rounded-2xl">
            {/* Animated gradient background */}
            <div className="absolute inset-0 fairlaunch-bg-animate" />

            {/* Scan line effect */}
            <div className="absolute inset-0 fairlaunch-scanlines" />

            {/* Glowing edges */}
            <div className="absolute inset-0 fairlaunch-glow-edges" />

            {/* Main Content */}
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                {/* Top ticker bar */}
                <div className="fairlaunch-ticker mb-4 sm:mb-6 overflow-hidden rounded-lg">
                    <div
                        className="fairlaunch-ticker-content whitespace-nowrap"
                        style={{ transform: `translateX(-${scrollPosition}%)` }}
                    >
                        <span className="inline-block px-4">🚀 WAGYDOG TOKEN FAIRLAUNCH</span>
                        <span className="inline-block px-4">•</span>
                        <span className="inline-block px-4">COMING SOON</span>
                        <span className="inline-block px-4">•</span>
                        <span className="inline-block px-4">NO PRESALE</span>
                        <span className="inline-block px-4">•</span>
                        <span className="inline-block px-4">100% FAIR DISTRIBUTION</span>
                        <span className="inline-block px-4">•</span>
                        <span className="inline-block px-4">🚀 WAGYDOG TOKEN FAIRLAUNCH</span>
                        <span className="inline-block px-4">•</span>
                        <span className="inline-block px-4">COMING SOON</span>
                        <span className="inline-block px-4">•</span>
                    </div>
                </div>

                {/* Main Banner Content */}
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
                    {/* Logo Section */}
                    <div className="fairlaunch-logo-container relative flex-shrink-0">
                        <div className="fairlaunch-logo-glow absolute inset-0" />
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                            <Image
                                src="/wagydog-logo.png"
                                alt="Wagydog Token"
                                width={160}
                                height={160}
                                className="object-contain fairlaunch-logo-pulse"
                            />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="fairlaunch-title-container mb-2">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wide">
                                <span className="fairlaunch-title-text">Wagydog Token</span>
                            </h2>
                        </div>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-300 mb-4">
                            Official Fairlaunch
                        </p>

                        {/* Countdown Display */}
                        <div className="flex justify-center lg:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {[
                                { value: '00', label: 'DAYS' },
                                { value: '00', label: 'HRS' },
                                { value: '00', label: 'MIN' },
                            ].map((unit, i) => (
                                <div key={unit.label} className="fairlaunch-countdown-unit">
                                    <span className="fairlaunch-countdown-value">{unit.value}</span>
                                    <span className="fairlaunch-countdown-label">{unit.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Badge */}
                        <div className="fairlaunch-cta inline-block">
                            <span className="text-sm sm:text-base font-bold tracking-widest">
                                STAY TUNED
                            </span>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="hidden lg:flex flex-col gap-3">
                        {['No Presale', 'Fair Distribution', 'Community First', 'Locked Liquidity'].map((feature) => (
                            <div key={feature} className="fairlaunch-feature">
                                <span className="fairlaunch-feature-check">✓</span>
                                <span className="text-sm font-medium text-white/90">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Features - Mobile */}
                <div className="flex lg:hidden flex-wrap justify-center gap-2 mt-4 sm:mt-6">
                    {['No Presale', 'Fair Distribution', 'Locked LP'].map((feature) => (
                        <span key={feature} className="fairlaunch-feature-badge">
                            {feature}
                        </span>
                    ))}
                </div>
            </div>

            {/* Corner accents */}
            <div className="fairlaunch-corner fairlaunch-corner-tl" />
            <div className="fairlaunch-corner fairlaunch-corner-tr" />
            <div className="fairlaunch-corner fairlaunch-corner-bl" />
            <div className="fairlaunch-corner fairlaunch-corner-br" />
        </div>
    );
}
