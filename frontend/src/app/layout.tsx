import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '../components/Providers';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Wagydog | Real-Time Crypto Analytics',
    description: 'Real-time crypto analytics platform for tracking tokens, pairs, and market trends across multiple chains.',
    icons: {
        icon: '/wagydog-logo.png',
        shortcut: '/wagydog-logo.png',
        apple: '/wagydog-logo.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/wagydog-logo.png" type="image/png" />
                <link rel="apple-touch-icon" href="/wagydog-logo.png" />
            </head>
            <body className={inter.className}>
                <Providers>
                    <div className="flex min-h-screen">
                        <Sidebar />
                        <div className="flex-1 flex flex-col min-w-0 max-w-full">
                            <Header />
                            <main className="flex-1 overflow-x-hidden pb-20 lg:pb-0">
                                {children}
                            </main>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
