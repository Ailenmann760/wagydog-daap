'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import SocketProvider from './SocketProvider';

// Configure wagmi for BSC
const config = createConfig({
    chains: [bsc],
    transports: {
        [bsc.id]: http(),
    },
});

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
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
