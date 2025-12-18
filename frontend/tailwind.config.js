/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Core theme colors
                primary: {
                    DEFAULT: '#2563eb',
                    accent: '#0ea5e9',
                    dark: '#1d4ed8',
                    light: '#3b82f6',
                },

                // Background colors
                bg: {
                    DEFAULT: '#0f172a',
                    alt: '#1e293b',
                    surface: 'rgba(30, 41, 59, 0.85)',
                    highlight: 'rgba(51, 65, 85, 0.9)',
                },

                // Border colors
                border: {
                    DEFAULT: 'rgba(100, 116, 139, 0.35)',
                    light: 'rgba(37, 99, 235, 0.15)',
                },

                // Text colors
                text: {
                    DEFAULT: '#f8fafc',
                    muted: '#94a3b8',
                    accent: '#7dd3fc',
                },

                // Status colors
                danger: '#ef4444',
                success: '#22c55e',
                warning: '#f59e0b',

                // Chain-specific colors
                chain: {
                    ethereum: '#627EEA',
                    bsc: '#F3BA2F',
                    solana: '#9945FF',
                    base: '#0052FF',
                    arbitrum: '#28A0F0',
                    polygon: '#8247E5',
                    avalanche: '#E84142',
                },

                // Trading colors
                buy: '#22c55e',
                sell: '#ef4444',

                // Special status
                snipe: '#eab308',
                hot: '#f97316',
                whale: '#8b5cf6',
            },

            backgroundImage: {
                'gradient-radial': 'radial-gradient(circle at 20% 20%, #1e293b 0%, #0f172a 45%, #020617 100%)',
                'gradient-surface': 'linear-gradient(145deg, rgba(37, 99, 235, 0.12), rgba(14, 165, 233, 0.06))',
                'gradient-primary': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                'gradient-success': 'linear-gradient(135deg, #22c55e, #16a34a)',
                'gradient-danger': 'linear-gradient(135deg, #ef4444, #dc2626)',
                'gradient-glow': 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            },

            boxShadow: {
                'elevated': '0 32px 64px -24px rgba(0, 0, 0, 0.55)',
                'soft': '0 20px 40px -24px rgba(0, 0, 0, 0.35)',
                'primary': '0 26px 48px -24px rgba(37, 99, 235, 0.45)',
                'success': '0 20px 40px -20px rgba(34, 197, 94, 0.35)',
                'danger': '0 20px 40px -20px rgba(239, 68, 68, 0.35)',
                'glow-primary': '0 0 30px rgba(37, 99, 235, 0.4)',
                'glow-success': '0 0 30px rgba(34, 197, 94, 0.4)',
                'glow-snipe': '0 0 30px rgba(234, 179, 8, 0.4)',
            },

            borderRadius: {
                'surface': '20px',
            },

            backdropBlur: {
                'surface': '18px',
            },

            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
            },

            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(37, 99, 235, 0.5)' },
                },
            },
        },
    },
    plugins: [],
}
