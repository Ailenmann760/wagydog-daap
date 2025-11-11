/**
 * WalletConnect production configuration.
 *
 * Required environment variables:
 * - VITE_WALLETCONNECT_PROJECT_ID (Required for WalletConnect v2)
 * - VITE_INFURA_API_KEY or VITE_ALCHEMY_API_KEY (For reliable RPC access)
 *
 * Values are read via import.meta.env at build/runtime.
 */

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY;
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

const buildRpcUrls = (urls) => urls.filter(Boolean);

export const SUPPORTED_CHAINS = [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrls: buildRpcUrls([
      INFURA_API_KEY && `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      ALCHEMY_API_KEY && `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      'https://cloudflare-eth.com',
    ]),
  },
  {
    chainId: 137,
    name: 'Polygon',
    rpcUrls: buildRpcUrls([
      INFURA_API_KEY && `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      ALCHEMY_API_KEY && `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      'https://polygon-rpc.com',
    ]),
  },
  {
    chainId: 1337,
    name: 'Localhost',
    rpcUrls: ['http://127.0.0.1:8545'],
  },
];

export const WALLET_CONFIG = {
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: SUPPORTED_CHAINS.map((chain) => chain.chainId),
  metadata: {
    name: 'WagyDog dApp',
    description: 'WagyDog DeFi experience with WalletConnect integration',
    url: 'https://wagydog.io',
    icons: ['https://wagydog.io/assets/wagydog-logo.png'],
  },
};

if (!WALLETCONNECT_PROJECT_ID) {
  console.warn('[web3] VITE_WALLETCONNECT_PROJECT_ID is not defined.');
}

if (!INFURA_API_KEY && !ALCHEMY_API_KEY) {
  console.warn(
    '[web3] Neither VITE_INFURA_API_KEY nor VITE_ALCHEMY_API_KEY is defined. RPC reliability may be impacted.',
  );
}
