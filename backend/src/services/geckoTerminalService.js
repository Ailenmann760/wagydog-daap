import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 30 }); // 30 second cache
const BASE_URL = 'https://api.geckoterminal.com/api/v2';

// Supported networks mapping
const NETWORKS = {
    ethereum: 'eth',
    bsc: 'bsc',
    solana: 'solana',
    base: 'base',
    arbitrum: 'arbitrum',
    polygon: 'polygon-pos',
    avalanche: 'avax',
};

/**
 * Rate-limited API request with caching
 */
async function apiRequest(endpoint, cacheKey = null) {
    const key = cacheKey || endpoint;
    const cached = cache.get(key);
    if (cached) return cached;

    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
                'Accept': 'application/json',
            },
            timeout: 10000,
        });

        if (response.data?.data) {
            cache.set(key, response.data.data);
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error(`GeckoTerminal API error for ${endpoint}:`, error.message);
        return null;
    }
}

/**
 * Get new pools across all supported networks or a specific network
 */
export async function getNewPools(network = null, limit = 50) {
    if (network && NETWORKS[network]) {
        const data = await apiRequest(`/networks/${NETWORKS[network]}/new_pools?page=1`);
        return (data || []).slice(0, limit).map(pool => normalizePool(pool, network));
    }

    // Aggregate from multiple networks
    const networks = ['ethereum', 'bsc', 'solana', 'base', 'arbitrum'];
    const results = await Promise.all(
        networks.map(async (net) => {
            const pools = await apiRequest(`/networks/${NETWORKS[net]}/new_pools?page=1`);
            return (pools || []).map(pool => normalizePool(pool, net));
        })
    );

    // Flatten and sort by creation time
    return results
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

/**
 * Get trending pools
 */
export async function getTrendingPools(network = null, limit = 24) {
    if (network && NETWORKS[network]) {
        const data = await apiRequest(`/networks/${NETWORKS[network]}/trending_pools`);
        return (data || []).slice(0, limit).map(pool => normalizePool(pool, network));
    }

    // Aggregate from multiple networks
    const networks = ['ethereum', 'bsc', 'solana'];
    const results = await Promise.all(
        networks.map(async (net) => {
            const pools = await apiRequest(`/networks/${NETWORKS[net]}/trending_pools`);
            return (pools || []).map(pool => normalizePool(pool, net));
        })
    );

    return results.flat().slice(0, limit);
}

/**
 * Get top gainers
 */
export async function getTopGainers(network = 'ethereum', limit = 20) {
    const networkId = NETWORKS[network] || network;
    const data = await apiRequest(`/networks/${networkId}/pools?sort=h24_price_change_percentage&order=desc&page=1`);
    return (data || []).slice(0, limit).map(pool => normalizePool(pool, network));
}

/**
 * Get top losers
 */
export async function getTopLosers(network = 'ethereum', limit = 20) {
    const networkId = NETWORKS[network] || network;
    const data = await apiRequest(`/networks/${networkId}/pools?sort=h24_price_change_percentage&order=asc&page=1`);
    return (data || []).slice(0, limit).map(pool => normalizePool(pool, network));
}

/**
 * Get pool/pair details
 */
export async function getPoolDetails(network, poolAddress) {
    const networkId = NETWORKS[network] || network;
    const data = await apiRequest(`/networks/${networkId}/pools/${poolAddress}`);
    return data ? normalizePool(data, network) : null;
}

/**
 * Get OHLCV chart data for a pool
 */
export async function getPoolOHLCV(network, poolAddress, timeframe = 'hour', aggregate = 1) {
    const networkId = NETWORKS[network] || network;
    const endpoint = `/networks/${networkId}/pools/${poolAddress}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=500`;
    const data = await apiRequest(endpoint, `ohlcv:${poolAddress}:${timeframe}:${aggregate}`);

    if (!data?.ohlcv_list) return [];

    return data.ohlcv_list.map(candle => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
    }));
}

/**
 * Get token info by address
 */
export async function getTokenInfo(network, tokenAddress) {
    const networkId = NETWORKS[network] || network;
    const data = await apiRequest(`/networks/${networkId}/tokens/${tokenAddress}`);
    return data ? normalizeToken(data, network) : null;
}

/**
 * Search for tokens
 */
export async function searchTokens(query, limit = 20) {
    const data = await apiRequest(`/search/pools?query=${encodeURIComponent(query)}&page=1`);
    return (data || []).slice(0, limit).map(pool => ({
        ...normalizePool(pool, pool.attributes?.network?.identifier || 'unknown'),
        searchMatch: true,
    }));
}

/**
 * Normalize pool data to consistent format
 */
function normalizePool(pool, network) {
    const attrs = pool.attributes || pool;
    const relationships = pool.relationships || {};

    const baseTokenRel = relationships.base_token?.data;
    const quoteTokenRel = relationships.quote_token?.data;

    // Calculate age in seconds
    const createdAt = attrs.pool_created_at || attrs.created_at;
    const ageSeconds = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000) : null;

    // Extract token symbols from pool name if attributes are missing
    // Pool name format is typically "BASE / QUOTE" (e.g., "PEPE / WETH")
    let baseSymbol = 'TOKEN';
    let quoteSymbol = 'QUOTE';

    // Try to get from direct attributes first
    if (attrs.base_token_symbol) {
        baseSymbol = attrs.base_token_symbol;
    }
    if (attrs.quote_token_symbol) {
        quoteSymbol = attrs.quote_token_symbol;
    }

    // If still default, parse from pool name
    if ((baseSymbol === 'TOKEN' || quoteSymbol === 'QUOTE') && attrs.name) {
        const nameParts = attrs.name.split(/\s*\/\s*/);
        if (nameParts.length >= 2) {
            baseSymbol = nameParts[0].trim() || baseSymbol;
            quoteSymbol = nameParts[1].trim() || quoteSymbol;
        }
    }

    return {
        id: pool.id,
        address: attrs.address || pool.id?.split('_')[1],
        name: attrs.name || `${baseSymbol} / ${quoteSymbol}`,
        chain: network,
        dex: attrs.dex?.name || attrs.dex_id || 'Unknown DEX',

        // Price data
        priceUSD: parseFloat(attrs.base_token_price_usd) || 0,
        priceNative: parseFloat(attrs.base_token_price_native_currency) || 0,
        priceChange24h: parseFloat(attrs.price_change_percentage?.h24) || 0,
        priceChange1h: parseFloat(attrs.price_change_percentage?.h1) || 0,
        priceChange5m: parseFloat(attrs.price_change_percentage?.m5) || 0,

        // Volume and liquidity
        volume24h: parseFloat(attrs.volume_usd?.h24) || 0,
        volume1h: parseFloat(attrs.volume_usd?.h1) || 0,
        liquidity: parseFloat(attrs.reserve_in_usd) || 0,
        fdv: parseFloat(attrs.fdv_usd) || 0,
        marketCap: parseFloat(attrs.market_cap_usd) || 0,

        // Token info - use parsed symbols
        baseToken: {
            address: baseTokenRel?.id?.split('_')[1] || attrs.base_token_address,
            symbol: baseSymbol,
            name: attrs.base_token_name || baseSymbol,
        },
        quoteToken: {
            address: quoteTokenRel?.id?.split('_')[1] || attrs.quote_token_address,
            symbol: quoteSymbol,
            name: attrs.quote_token_name || quoteSymbol,
        },

        // Metadata
        createdAt: createdAt,
        ageSeconds: ageSeconds,
        ageFormatted: formatAge(ageSeconds),

        // Transactions
        txns24h: {
            buys: parseInt(attrs.transactions?.h24?.buys) || 0,
            sells: parseInt(attrs.transactions?.h24?.sells) || 0,
        },

        // URLs
        url: `https://www.geckoterminal.com/${NETWORKS[network] || network}/pools/${attrs.address}`,
    };
}

/**
 * Normalize token data
 */
function normalizeToken(token, network) {
    const attrs = token.attributes || token;

    return {
        id: token.id,
        address: attrs.address || token.id?.split('_')[1],
        name: attrs.name || 'Unknown Token',
        symbol: attrs.symbol || 'TOKEN',
        chain: network,
        decimals: parseInt(attrs.decimals) || 18,
        logoUrl: attrs.image_url || null,
        coingeckoId: attrs.coingecko_coin_id || null,
        priceUSD: parseFloat(attrs.price_usd) || 0,
        fdv: parseFloat(attrs.fdv_usd) || 0,
        marketCap: parseFloat(attrs.market_cap_usd) || 0,
        totalSupply: attrs.total_supply || null,
    };
}

/**
 * Format age in human-readable format
 */
function formatAge(seconds) {
    if (!seconds || seconds < 0) return 'Unknown';

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Calculate snipe score (0-100) based on pool characteristics
 * Higher score = potentially better snipe opportunity
 */
export function calculateSnipeScore(pool) {
    let score = 50; // Base score

    // Age factor: newer is better for sniping
    if (pool.ageSeconds) {
        if (pool.ageSeconds < 300) score += 30;      // < 5 min
        else if (pool.ageSeconds < 1800) score += 20; // < 30 min
        else if (pool.ageSeconds < 3600) score += 10; // < 1 hour
        else if (pool.ageSeconds > 86400) score -= 20; // > 1 day
    }

    // Liquidity factor: decent liquidity is important
    if (pool.liquidity) {
        if (pool.liquidity >= 10000 && pool.liquidity <= 100000) score += 15;
        else if (pool.liquidity > 100000) score += 5;
        else if (pool.liquidity < 1000) score -= 20; // Too low = risky
    }

    // Transaction activity
    const totalTxns = (pool.txns24h?.buys || 0) + (pool.txns24h?.sells || 0);
    if (totalTxns > 100) score += 10;
    else if (totalTxns > 50) score += 5;

    // Price momentum
    if (pool.priceChange5m > 10) score += 5;
    if (pool.priceChange1h > 20) score += 5;

    return Math.max(0, Math.min(100, score));
}

export default {
    getNewPools,
    getTrendingPools,
    getTopGainers,
    getTopLosers,
    getPoolDetails,
    getPoolOHLCV,
    getTokenInfo,
    searchTokens,
    calculateSnipeScore,
    NETWORKS,
};
