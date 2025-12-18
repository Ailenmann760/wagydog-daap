import geckoService from '../services/geckoTerminalService.js';
import newTokenDetector from '../services/newTokenDetector.js';

/**
 * Initialize WebSocket server and handle real-time data broadcasting
 */
export default function initializeWebSocket(io) {
    // Start the new token detector
    const stopDetector = newTokenDetector.startDetector({
        chains: ['ethereum', 'bsc', 'solana', 'base', 'arbitrum'],
        pollInterval: 15000, // 15 seconds
        minLiquidity: 1000,
        maxAge: 3600, // 1 hour
    });

    // Register callback for new pool discoveries
    newTokenDetector.onNewPool((pool) => {
        // Broadcast to all clients subscribed to new pools
        io.to('newPools').emit('newPool', pool);
        io.to(`newPools:${pool.chain}`).emit('newPool', pool);
    });

    io.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);

        // Subscribe to new pools (all chains)
        socket.on('subscribe:newPools', (chain = null) => {
            if (chain) {
                socket.join(`newPools:${chain}`);
                console.log(`Client ${socket.id} subscribed to new pools on ${chain}`);
            } else {
                socket.join('newPools');
                console.log(`Client ${socket.id} subscribed to all new pools`);
            }

            // Send recent discoveries immediately
            const recent = newTokenDetector.getRecentDiscoveries(20, chain);
            socket.emit('recentPools', recent);
        });

        // Subscribe to price updates for specific pairs
        socket.on('subscribe:price', (pairIds) => {
            if (Array.isArray(pairIds)) {
                pairIds.forEach(pairId => {
                    socket.join(`price:${pairId}`);
                });
                console.log(`Client ${socket.id} subscribed to ${pairIds.length} pairs`);
            }
        });

        // Subscribe to live trades for a pair
        socket.on('subscribe:trades', (data) => {
            const { chain, pairAddress } = data;
            socket.join(`trades:${chain}:${pairAddress}`);
            console.log(`Client ${socket.id} subscribed to trades for ${pairAddress}`);
        });

        // Subscribe to trending tokens
        socket.on('subscribe:trending', () => {
            socket.join('trending');
            console.log(`Client ${socket.id} subscribed to trending`);
        });

        // Subscribe to a specific chain
        socket.on('subscribe:chain', (chain) => {
            socket.join(`chain:${chain}`);
            console.log(`Client ${socket.id} subscribed to ${chain}`);
        });

        // Unsubscribe handlers
        socket.on('unsubscribe:newPools', (chain = null) => {
            if (chain) {
                socket.leave(`newPools:${chain}`);
            } else {
                socket.leave('newPools');
            }
        });

        socket.on('unsubscribe:price', (pairIds) => {
            if (Array.isArray(pairIds)) {
                pairIds.forEach(pairId => socket.leave(`price:${pairId}`));
            }
        });

        socket.on('unsubscribe:trades', (data) => {
            const { chain, pairAddress } = data;
            socket.leave(`trades:${chain}:${pairAddress}`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    // Broadcast trending updates every 30 seconds
    setInterval(async () => {
        try {
            const trending = await geckoService.getTrendingPools(null, 24);
            io.to('trending').emit('trending:update', trending);
        } catch (error) {
            console.error('Error broadcasting trending:', error);
        }
    }, 30000);

    // Broadcast price updates every 10 seconds
    setInterval(async () => {
        try {
            // Get top pools for price updates
            const chains = ['ethereum', 'bsc', 'solana'];

            for (const chain of chains) {
                const pools = await geckoService.getTrendingPools(chain, 20);

                pools.forEach(pool => {
                    io.to(`price:${pool.address}`).emit('price:update', {
                        pairId: pool.address,
                        chain: pool.chain,
                        price: pool.priceUSD,
                        change24h: pool.priceChange24h,
                        change1h: pool.priceChange1h,
                        volume24h: pool.volume24h,
                        liquidity: pool.liquidity,
                        timestamp: new Date().toISOString(),
                    });
                });

                // Broadcast to chain subscribers
                io.to(`chain:${chain}`).emit('chainUpdate', {
                    chain,
                    pools: pools.slice(0, 10),
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error broadcasting price updates:', error);
        }
    }, 10000);

    // Broadcast detector stats every minute
    setInterval(() => {
        const stats = newTokenDetector.getDetectorStats();
        io.to('newPools').emit('detectorStats', stats);
    }, 60000);

    console.log('✅ WebSocket handlers initialized with live data feeds');

    // Return cleanup function
    return () => {
        stopDetector();
    };
}
