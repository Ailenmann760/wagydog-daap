'use client';

import { useState } from 'react';

// Chain logo URLs
const CHAIN_LOGOS = {
    ethereum: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    bsc: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    solana: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
    base: 'https://images.mirror-media.xyz/publication-images/cgqxxPdUFBDjgKna_dDir.png',
    arbitrum: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
    polygon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
};

const chains = [
    { id: null, name: 'All Chains', icon: '🌐' },
    { id: 'ethereum', name: 'Ethereum', icon: null, logo: CHAIN_LOGOS.ethereum },
    { id: 'bsc', name: 'BNB Chain', icon: null, logo: CHAIN_LOGOS.bsc },
    { id: 'polygon', name: 'Polygon', icon: null, logo: CHAIN_LOGOS.polygon },
    { id: 'arbitrum', name: 'Arbitrum', icon: null, logo: CHAIN_LOGOS.arbitrum },
    { id: 'solana', name: 'Solana', icon: null, logo: CHAIN_LOGOS.solana },
];

export default function ChainSelector({ selectedChain, onChainChange }) {
    // Use internal state if not controlled
    const [internalSelected, setInternalSelected] = useState(null);
    const selected = selectedChain !== undefined ? selectedChain : internalSelected;

    const handleSelect = (chainId) => {
        if (onChainChange) {
            onChainChange(chainId);
        } else {
            setInternalSelected(chainId);
        }
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {chains.map((chain) => (
                <button
                    key={chain.id || 'all'}
                    onClick={() => handleSelect(chain.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${selected === chain.id
                            ? 'bg-primary text-white'
                            : 'bg-bg-surface text-text-muted hover:bg-white/10 hover:text-text'
                        }`}
                >
                    {chain.logo ? (
                        <img
                            src={chain.logo}
                            alt={chain.name}
                            className="w-5 h-5 rounded-full"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <span className="text-lg">{chain.icon}</span>
                    )}
                    <span className="font-medium hidden sm:inline">{chain.name}</span>
                </button>
            ))}
        </div>
    );
}
