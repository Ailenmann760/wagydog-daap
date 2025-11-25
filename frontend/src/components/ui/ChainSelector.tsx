'use client';

import { useState } from 'react';

const chains = [
    { id: 'all', name: 'All Chains', icon: '🌐' },
    { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
    { id: 'bsc', name: 'BNB Chain', icon: '⬡' },
    { id: 'polygon', name: 'Polygon', icon: '⬢' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '◆' },
    { id: 'solana', name: 'Solana', icon: '◎' },
];

export default function ChainSelector() {
    const [selected, setSelected] = useState('all');

    return (
        <div className="flex items-center gap-2 overflow-x-auto">
            {chains.map((chain) => (
                <button
                    key={chain.id}
                    onClick={() => setSelected(chain.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${selected === chain.id
                            ? 'bg-primary text-white'
                            : 'bg-bg-surface text-text-muted hover:bg-white/5'
                        }`}
                >
                    <span className="text-lg">{chain.icon}</span>
                    <span className="font-medium hidden sm:inline">{chain.name}</span>
                </button>
            ))}
        </div>
    );
}
