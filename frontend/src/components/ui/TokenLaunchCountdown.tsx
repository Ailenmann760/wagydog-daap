'use client';

import Image from 'next/image';

export default function TokenLaunchCountdown() {
    // Static zero values for "Coming Soon" state
    const timeUnits = [
        { value: '00', label: 'DAYS' },
        { value: '00', label: 'HOURS' },
        { value: '00', label: 'MINUTES' },
    ];

    return (
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 lg:p-8 countdown-container">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-radial from-blue-600/15 via-transparent to-transparent translate-x-1/2" />

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="particle particle-1" />
                <div className="particle particle-2" />
                <div className="particle particle-3" />
                <div className="particle particle-4" />
            </div>

            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl countdown-border-glow" />

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Logo and Header */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex-shrink-0">
                        <Image
                            src="/wagydog-logo.png"
                            alt="Wagydog Logo"
                            width={80}
                            height={80}
                            className="object-contain drop-shadow-glow"
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            Wagydog Token
                        </h2>
                        <p className="text-blue-300 text-xs sm:text-sm lg:text-base font-medium mt-1">
                            Launch Countdown
                        </p>
                    </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-6 mb-6 sm:mb-8">
                    {timeUnits.map((unit, index) => (
                        <div key={unit.label} className="flex items-center gap-2 sm:gap-3 lg:gap-6">
                            <div className="countdown-unit-container">
                                <div className="countdown-unit">
                                    <span className="countdown-value">{unit.value}</span>
                                    <span className="countdown-label">{unit.label}</span>
                                </div>
                                <div className="countdown-unit-glow" />
                            </div>
                            {index < timeUnits.length - 1 && (
                                <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-blue-400 countdown-separator">:</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Coming Soon Badge */}
                <div className="relative">
                    <div className="coming-soon-badge">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wider">
                            COMING SOON
                        </span>
                    </div>
                    <div className="coming-soon-glow" />
                </div>

                {/* Additional info */}
                <p className="mt-4 sm:mt-6 text-text-muted text-xs sm:text-sm lg:text-base max-w-md px-2">
                    The future of crypto analytics. Stay tuned for the official token launch.
                </p>
            </div>
        </div>
    );
}
