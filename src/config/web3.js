/**
 * WalletConnect & Wagmi configuration for the client app.
 *
 * Required environment variables:
 * - VITE_WALLETCONNECT_PROJECT_ID (WalletConnect v2 project id)
 * - VITE_INFURA_API_KEY or VITE_ALCHEMY_API_KEY (Optional, used for Ethereum/Polygon RPC reliability)
 *
 * Values are read via import.meta.env at build/runtime.
 */

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { bscTestnet, mainnet, polygon } from 'wagmi/chains';

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY;
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

const buildRpcUrls = (urls) => urls.filter(Boolean);

const CHAINS = [bscTestnet, mainnet, polygon];

const CHAIN_RPC_URLS = {
  [mainnet.id]: buildRpcUrls([
    INFURA_API_KEY && `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    ALCHEMY_API_KEY && `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    'https://cloudflare-eth.com',
  ]),
  [polygon.id]: buildRpcUrls([
    INFURA_API_KEY && `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    ALCHEMY_API_KEY && `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    'https://polygon-rpc.com',
  ]),
  [bscTestnet.id]: buildRpcUrls([
    'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
    'https://data-seed-prebsc-1-s2.bnbchain.org:8545',
    'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
  ]),
};

export const SUPPORTED_CHAINS = [
  ...CHAINS.map((chain) => ({
    chainId: chain.id,
    name: chain.name,
    rpcUrls: CHAIN_RPC_URLS[chain.id] ?? [],
  })),
  {
    chainId: 1337,
    name: 'Localhost',
    rpcUrls: ['http://127.0.0.1:8545'],
  },
];

export const WALLET_CONFIG = {
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: CHAINS.map((chain) => chain.id),
  metadata: {
    name: 'WagyDog dApp',
    description: 'WagyDog DeFi experience with WalletConnect integration',
    url: 'https://wagydog.io',
    icons: ['https://wagydog.io/assets/wagydog-logo.png'],
  },
};

const transports = CHAINS.reduce((acc, chain) => {
  const [primaryRpc] = CHAIN_RPC_URLS[chain.id] ?? [];
  if (primaryRpc) {
    acc[chain.id] = http(primaryRpc);
  } else if (chain.rpcUrls?.default?.http?.length) {
    acc[chain.id] = http(chain.rpcUrls.default.http[0]);
  } else {
    console.warn(`[web3] No RPC URL configured for ${chain.name} (${chain.id}).`);
  }
  return acc;
}, {});

const connectors = [injected({ shimDisconnect: true })];

if (WALLETCONNECT_PROJECT_ID) {
  connectors.push(
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: WALLET_CONFIG.metadata,
      showQrModal: false,
    }),
  );
} else {
  console.warn('[web3] VITE_WALLETCONNECT_PROJECT_ID is not defined. WalletConnect connector is disabled.');
}

export const config = createConfig({
  chains: CHAINS,
  transports,
  connectors,
  ssr: true,
});

if (!INFURA_API_KEY && !ALCHEMY_API_KEY) {
  console.warn(
    '[web3] Neither VITE_INFURA_API_KEY nor VITE_ALCHEMY_API_KEY is defined. RPC reliability may be impacted.',
  );
}

let hasInitializedModal = false;

export const initializeWeb3Modal = () => {
  if (hasInitializedModal || typeof window === 'undefined') {
    return;
  }

  if (!WALLETCONNECT_PROJECT_ID) {
    console.warn('[web3] Skipping Web3Modal initialization because VITE_WALLETCONNECT_PROJECT_ID is not defined.');
    return;
  }

  createWeb3Modal({
    wagmiConfig: config,
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: CHAINS,
  });

  hasInitializedModal = true;
};
