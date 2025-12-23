'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import SocketProvider from './SocketProvider';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8fffef3be8da4bad69554f2027154d21';

// Configure wagmi for BSC with multiple wallet options
const config = createConfig({
    chains: [bsc],
    connectors: [
        injected({
            shimDisconnect: true,
        }),
        walletConnect({
            projectId,
            showQrModal: true,
            metadata: {
                name: 'Wagydog',
                description: 'Wagydog Token Presale',
                url: 'https://wagydog.com',
                icons: ['https://wagydog.com/wagydog-logo.png'],
            },
        }),
    ],
    transports: {
        [bsc.id]: http('https://bsc-dataseed.binance.org'),
    },
});

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
