import geckoService from './geckoTerminalService.js';

// Store for tracking seen pools to detect truly new ones
const seenPools = new Map();
const CLEANUP_INTERVAL = 60 * 60 * 1000; // Clean up every hour
const MAX_POOL_AGE = 24 * 60 * 60 * 1000; // Keep pools for 24 hours

// Event emitter for new pool discoveries
let newPoolCallbacks = [];

/**
 * Register callback for new pool discoveries
 */
export function onNewPool(callback) {
    newPoolCallbacks.push(callback);
    return () => {
        newPoolCallbacks = newPoolCallbacks.filter(cb => cb !== callback);
    };
}

/**
 * Emit new pool event to all registered callbacks
 */
function emitNewPool(pool) {
    newPoolCallbacks.forEach(callback => {
        try {
            callback(pool);
        } catch (error) {
            console.error('Error in new pool callback:', error);
        }
    });
}

/**
 * Start the new token detector
 * Polls for new pools across multiple chains and emits events for new discoveries
 */
export function startDetector(options = {}) {
    const {
        chains = ['ethereum', 'bsc', 'solana', 'base', 'arbitrum'],
        pollInterval = 15000, // 15 seconds
        minLiquidity = 1000, // Minimum $1000 liquidity
        maxAge = 3600, // Only pools < 1 hour old
    } = options;

    console.log('🔍 Starting new token detector...');
    console.log(`   Chains: ${chains.join(', ')}`);
    console.log(`   Poll interval: ${pollInterval}ms`);
    console.log(`   Min liquidity: $${minLiquidity}`);

    // Initial fetch
    checkForNewPools(chains, minLiquidity, maxAge);

    // Set up polling
    const pollTimer = setInterval(() => {
        checkForNewPools(chains, minLiquidity, maxAge);
    }, pollInterval);

    // Cleanup old entries periodically
    const cleanupTimer = setInterval(() => {
        cleanupSeenPools();
    }, CLEANUP_INTERVAL);

    // Return stop function
    return () => {
        clearInterval(pollTimer);
        clearInterval(cleanupTimer);
        console.log('🛑 New token detector stopped');
    };
}

/**
 * Check for new pools across specified chains
 */
async function checkForNewPools(chains, minLiquidity, maxAge) {
    try {
        for (const chain of chains) {
            const pools = await geckoService.getNewPools(chain, 50);

            if (!pools || pools.length === 0) continue;

            for (const pool of pools) {
                // Skip if already seen
                if (seenPools.has(pool.address)) continue;

                // Skip if below minimum liquidity
                if (pool.liquidity < minLiquidity) continue;

                // Skip if too old
                if (pool.ageSeconds && pool.ageSeconds > maxAge) continue;

                // Calculate snipe score
                pool.snipeScore = geckoService.calculateSnipeScore(pool);

                // Mark as seen
                seenPools.set(pool.address, {
                    discoveredAt: Date.now(),
                    pool,
                });

                // Emit event
                emitNewPool({
                    ...pool,
                    isNew: true,
                    discoveredAt: new Date().toISOString(),
                });

                console.log(`🆕 New pool detected: ${pool.baseToken?.symbol}/${pool.quoteToken?.symbol} on ${pool.chain} (Score: ${pool.snipeScore})`);
            }
        }
    } catch (error) {
        console.error('Error checking for new pools:', error.message);
    }
}

/**
 * Cleanup old entries from seenPools
 */
function cleanupSeenPools() {
    const now = Date.now();
    let cleaned = 0;

    for (const [address, data] of seenPools.entries()) {
        if (now - data.discoveredAt > MAX_POOL_AGE) {
            seenPools.delete(address);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} old pool entries`);
    }
}

/**
 * Get recently discovered pools
 */
export function getRecentDiscoveries(limit = 50, chain = null) {
    const entries = Array.from(seenPools.values())
        .filter(entry => !chain || entry.pool.chain === chain)
        .sort((a, b) => b.discoveredAt - a.discoveredAt)
        .slice(0, limit);

    return entries.map(entry => ({
        ...entry.pool,
        discoveredAt: new Date(entry.discoveredAt).toISOString(),
        timeSinceDiscovery: Math.floor((Date.now() - entry.discoveredAt) / 1000),
    }));
}

/**
 * Get stats about the detector
 */
export function getDetectorStats() {
    const chains = {};
    let totalSnipeScore = 0;

    for (const [, data] of seenPools.entries()) {
        const chain = data.pool.chain;
        chains[chain] = (chains[chain] || 0) + 1;
        totalSnipeScore += data.pool.snipeScore || 0;
    }

    return {
        totalPoolsTracked: seenPools.size,
        poolsByChain: chains,
        averageSnipeScore: seenPools.size > 0 ? Math.round(totalSnipeScore / seenPools.size) : 0,
        uptime: process.uptime(),
    };
}

export default {
    startDetector,
    onNewPool,
    getRecentDiscoveries,
    getDetectorStats,
};
