'use client';

import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceRef = useRef(null);
    const router = useRouter();

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

    const handleResultClick = (token: any) => {
        // Get pool address if available, otherwise use token address
        const poolAddress = token.pairs?.[0]?.address || token.address;
        const chain = token.chain || 'ethereum';

        // Navigate immediately
        setShowResults(false);
        setQuery('');
        router.push(`/token/${poolAddress}?chain=${chain}`);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    placeholder="Search tokens..."
                    className="w-full pl-10 pr-10 py-2 bg-bg-surface border border-border rounded-lg focus:outline-none focus:border-primary transition"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg p-4 text-center text-text-muted shadow-2xl">
                    Searching...
                </div>
            )}

            {/* Results dropdown - solid dark background */}
            {showResults && !loading && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
                    {results.map((token: any) => {
                        const poolAddress = token.pairs?.[0]?.address || token.address;

                        return (
                            <button
                                key={token.id || token.address}
                                onClick={() => handleResultClick(token)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition border-b border-slate-800 last:border-0 text-left"
                            >
                                {/* Token Icon */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center font-bold text-sm shrink-0">
                                    {(token.symbol || 'T')[0]}
                                </div>

                                {/* Token Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">{token.symbol}</span>
                                        <span className="text-slate-400 text-sm truncate">{token.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 capitalize">
                                            {token.chain || 'ethereum'}
                                        </span>
                                        {token.pairs?.length > 0 && (
                                            <span className="text-slate-500">
                                                {token.pairs.length} pair{token.pairs.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Price Info */}
                                {token.pairs?.[0] && (
                                    <div className="text-right shrink-0">
                                        <div className="font-semibold text-white">
                                            ${token.pairs[0].priceUSD < 0.0001
                                                ? token.pairs[0].priceUSD.toExponential(2)
                                                : token.pairs[0].priceUSD.toFixed(4)}
                                        </div>
                                        <div className={`text-sm ${token.pairs[0].priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {token.pairs[0].priceChange24h >= 0 ? '+' : ''}
                                            {token.pairs[0].priceChange24h?.toFixed(2) || 0}%
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* No results */}
            {showResults && !loading && query.length >= 2 && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg p-4 text-center text-slate-400 shadow-2xl">
                    No tokens found for "{query}"
                </div>
            )}
        </div>
    );
}
