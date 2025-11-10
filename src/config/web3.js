import { PROJECT_ID, CHAIN_CONFIG } from './blockchain';
import { createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { createWeb3Modal } from '@web3modal/wagmi/react';

const chain = bscTestnet;

export const config = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(CHAIN_CONFIG.rpcUrls[0]),
  },
});

createWeb3Modal({
  wagmiConfig: config,
  projectId: PROJECT_ID,
  enableAnalytics: true,
  themeVariables: {
    '--w3m-color-mix': 'var(--color-primary)',
    '--w3m-color-mix-strength': 40,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-accent-color': 'var(--color-primary)',
    '--w3m-button-border-radius': '12px',
    '--w3m-background-color': 'var(--color-bg-alt)',
  },
});
