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
                // Professional Blue theme (Coinbase-style)
                primary: {
                    DEFAULT: '#2563eb', // Professional Blue
                    accent: '#0ea5e9',  // Sky Blue
                    dark: '#1d4ed8',    // Darker Blue
                    light: '#3b82f6',   // Lighter Blue
                },
                bg: {
                    DEFAULT: '#0f172a',                // Dark Navy
                    alt: '#1e293b',                    // Slate
                    surface: 'rgba(30, 41, 59, 0.85)', // Translucent Slate
                    highlight: 'rgba(51, 65, 85, 0.9)', // Lighter Slate
                },
                border: {
                    DEFAULT: 'rgba(100, 116, 139, 0.35)', // Slate border
                    light: 'rgba(37, 99, 235, 0.15)',     // Blue tint border
                },
                text: {
                    DEFAULT: '#f8fafc',  // Almost White
                    muted: '#94a3b8',    // Slate Gray
                    accent: '#7dd3fc',   // Light Blue accent
                },
                danger: '#ef4444',   // Red
                success: '#22c55e',  // Green
                warning: '#f59e0b',  // Amber
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(circle at 20% 20%, #1e293b 0%, #0f172a 45%, #020617 100%)',
                'gradient-surface': 'linear-gradient(145deg, rgba(37, 99, 235, 0.12), rgba(14, 165, 233, 0.06))',
                'gradient-primary': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            },
            boxShadow: {
                'elevated': '0 32px 64px -24px rgba(0, 0, 0, 0.55)',
                'soft': '0 20px 40px -24px rgba(0, 0, 0, 0.35)',
                'primary': '0 26px 48px -24px rgba(37, 99, 235, 0.45)',
            },
            borderRadius: {
                'surface': '20px',
            },
            backdropBlur: {
                'surface': '18px',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
