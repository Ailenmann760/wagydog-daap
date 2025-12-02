import NodeCache from 'node-cache';
import { prisma } from '../server.js';

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 300 });

/**
 * Initialize WebSocket server and handle real-time data broadcasting
 */
export default function initializeWebSocket(io) {
    io.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);

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
        socket.on('subscribe:trades', (pairId) => {
            socket.join(`trades:${pairId}`);
            console.log(`Client ${socket.id} subscribed to trades for ${pairId}`);
        });

        // Subscribe to trending tokens
        socket.on('subscribe:trending', () => {
            socket.join('trending');
            console.log(`Client ${socket.id} subscribed to trending`);
        });

        // Unsubscribe handlers
        socket.on('unsubscribe:price', (pairIds) => {
            if (Array.isArray(pairIds)) {
                pairIds.forEach(pairId => socket.leave(`price:${pairId}`));
            }
        });

        socket.on('unsubscribe:trades', (pairId) => {
            socket.leave(`trades:${pairId}`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    // Broadcast price updates every 5 seconds
    setInterval(async () => {
        try {
            // Get all active pairs (in production, only get subscribed pairs)
            const pairs = await prisma.pair.findMany({
                take: 50,
                orderBy: { volume24h: 'desc' },
                include: {
                    tokenA: { select: { symbol: true, logoUrl: true } },
                    tokenB: { select: { symbol: true, logoUrl: true } },
                },
            });

            // Simulate price changes for demo (in production, fetch from APIs)
            const priceUpdates = pairs.map(pair => ({
                pairId: pair.id,
                pairAddress: pair.pairAddress,
                price: pair.priceUSD * (1 + (Math.random() - 0.5) * 0.02), // ±1% change
                change24h: pair.priceChange24h + (Math.random() - 0.5) * 0.5,
                volume24h: pair.volume24h,
                liquidity: pair.liquidity,
                timestamp: new Date().toISOString(),
            }));

            // Broadcast to subscribed clients
            priceUpdates.forEach(update => {
                io.to(`price:${update.pairId}`).emit('price:update', update);
            });

        } catch (error) {
            console.error('Error broadcasting price updates:', error);
        }
    }, 5000);

    // Broadcast live trades simulation
    setInterval(async () => {
        try {
            // Simulate random trades for active pairs
            const randomTradeCount = Math.floor(Math.random() * 5) + 1;

            for (let i = 0; i < randomTradeCount; i++) {
                const pairs = await prisma.pair.findMany({ take: 10 });
                if (pairs.length === 0) continue;

                const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
                const isBuy = Math.random() > 0.5;

                const trade = {
                    pairId: randomPair.id,
                    type: isBuy ? 'BUY' : 'SELL',
                    amountUSD: Math.random() * 10000 + 100,
                    priceUSD: randomPair.priceUSD * (1 + (Math.random() - 0.5) * 0.01),
                    timestamp: new Date().toISOString(),
                    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
                };

                // Broadcast to clients subscribed to this pair
                io.to(`trades:${randomPair.id}`).emit('trade:new', trade);
            }
        } catch (error) {
            console.error('Error broadcasting trades:', error);
        }
    }, 3000);

    // Broadcast trending updates every 30 seconds
    setInterval(async () => {
        try {
            const trending = await prisma.trendingToken.findMany({
                take: 24,
                orderBy: { rank: 'asc' },
                where: {
                    timestamp: {
                        gte: new Date(Date.now() - 1000 * 60 * 10), // Last 10 minutes
                    },
                },
                include: {
                    token: {
                        include: {
                            pairsA: {
                                take: 1,
                                orderBy: { volume24h: 'desc' },
                            },
                        },
                    },
                },
            });

            io.to('trending').emit('trending:update', trending);
        } catch (error) {
            console.error('Error broadcasting trending:', error);
        }
    }, 30000);

    console.log('✅ WebSocket handlers initialized');
}
