'use client';

import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const response = await axios.get(`${apiUrl}/api/tokens/search?q=${query}`);
                setResults(response.data.data || []);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [query]);

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    placeholder="Search tokens..."
                    className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border rounded-lg focus:outline-none focus:border-primary transition"
                />
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-surface rounded-lg shadow-elevated max-h-96 overflow-y-auto">
                    {results.map((token) => (
                        <Link
                            key={token.id}
                            href={`/token/${token.address}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition border-b border-border last:border-0"
                        >
                            {token.logoUrl && (
                                <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{token.symbol}</span>
                                    <span className="text-text-muted text-sm">{token.name}</span>
                                </div>
                                <div className="text-xs text-text-muted">{token.chain}</div>
                            </div>
                            {token.pairs?.[0] && (
                                <div className="text-right">
                                    <div className="font-semibold">${token.pairs[0].priceUSD.toFixed(4)}</div>
                                    <div className={`text-sm ${token.pairs[0].priceChange24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {token.pairs[0].priceChange24h >= 0 ? '+' : ''}
                                        {token.pairs[0].priceChange24h.toFixed(2)}%
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
