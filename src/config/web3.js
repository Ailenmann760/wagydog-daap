import { PROJECT_ID, CHAIN_CONFIG } from './blockchain';
import { http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

const chain = bscTestnet;
const chains = [chain];
const chainId = chain.id;
const resolvedChainId = Number(CHAIN_CONFIG.chainId);

if (!Number.isFinite(resolvedChainId) || resolvedChainId !== chainId) {
  console.warn(
    `[web3] CHAIN_CONFIG chainId (${CHAIN_CONFIG.chainId}) is out of sync with wagmi chain id (${chainId}).`,
  );
}

const metadata = {
  name: 'WagyDog dApp',
  description: 'WagyDog token factory and DeFi control center on BNB Chain',
  url: 'https://wagydog.io',
  icons: ['https://wagydog.io/assets/wagydog-logo.png'],
};

export const config = defaultWagmiConfig({
  projectId: PROJECT_ID,
  chains,
  metadata,
  transports: {
    [chainId]: http(CHAIN_CONFIG.rpcUrls[0]),
  },
  autoConnect: false,
  ssr: true,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId: PROJECT_ID,
  chains,
  defaultChain: chain,
  enableAnalytics: true,
  featuredWalletIds: ['metaMask', 'trust', 'okx', 'phantom', 'coin98'],
  themeVariables: {
    '--w3m-color-mix': 'var(--color-primary)',
    '--w3m-color-mix-strength': 40,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-accent-color': 'var(--color-primary)',
    '--w3m-button-border-radius': '12px',
    '--w3m-background-color': 'var(--color-bg-alt)',
  },
});
