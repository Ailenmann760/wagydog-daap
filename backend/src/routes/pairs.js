import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * GET /api/pairs/trending
 * Get trending pairs
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const chain = req.query.chain;

        const pairs = await prisma.pair.findMany({
            take: limit,
            where: {
                ...(chain && { chain }),
            },
            orderBy: [
                { volume24h: 'desc' },
                { liquidity: 'desc' },
            ],
            include: {
                tokenA: true,
                tokenB: true,
            },
        });

        res.json({
            success: true,
            data: pairs,
        });
    } catch (error) {
        console.error('Error fetching trending pairs:', error);
        res.status(500).json({ error: 'Failed to fetch trending pairs' });
    }
});

/**
 * GET /api/pairs/:pairAddress
 * Get pair details
 */
router.get('/:pairAddress', async (req, res) => {
    try {
        const { pairAddress } = req.params;

        const pair = await prisma.pair.findUnique({
            where: { pairAddress },
            include: {
                tokenA: true,
                tokenB: true,
            },
        });

        if (!pair) {
            return res.status(404).json({ error: 'Pair not found' });
        }

        res.json({
            success: true,
            data: pair,
        });
    } catch (error) {
        console.error('Error fetching pair:', error);
        res.status(500).json({ error: 'Failed to fetch pair' });
    }
});

/**
 * GET /api/pairs/:pairAddress/chart
 * Get OHLCV chart data for a pair
 */
router.get('/:pairAddress/chart', async (req, res) => {
    try {
        const { pairAddress } = req.params;
        const { interval = '1h', from, to } = req.query;

        const pair = await prisma.pair.findUnique({
            where: { pairAddress },
            select: { id: true },
        });

        if (!pair) {
            return res.status(404).json({ error: 'Pair not found' });
        }

        const whereClause = {
            pairId: pair.id,
            interval,
            ...(from && { timestamp: { gte: new Date(parseInt(from)) } }),
            ...(to && { timestamp: { lte: new Date(parseInt(to)) } }),
        };

        const chartData = await prisma.chartData.findMany({
            where: whereClause,
            orderBy: { timestamp: 'asc' },
            take: 1000, // Limit to prevent excessive data
        });

        // If no data exists, generate some mock data for demo
        if (chartData.length === 0) {
            const mockData = generateMockChartData(interval, from, to);
            res.json({
                success: true,
                data: mockData,
                isMock: true,
            });
        } else {
            res.json({
                success: true,
                data: chartData,
                isMock: false,
            });
        }
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

/**
 * GET /api/pairs/:pairAddress/trades
 * Get recent trades for a pair
 */
router.get('/:pairAddress/trades', async (req, res) => {
    try {
        const { pairAddress } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const pair = await prisma.pair.findUnique({
            where: { pairAddress },
            select: { id: true },
        });

        if (!pair) {
            return res.status(404).json({ error: 'Pair not found' });
        }

        const trades = await prisma.trade.findMany({
            where: { pairId: pair.id },
            take: limit,
            orderBy: { timestamp: 'desc' },
        });

        res.json({
            success: true,
            data: trades,
        });
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

/**
 * Helper function to generate mock chart data
 */
function generateMockChartData(interval, from, to) {
    const data = [];
    const now = Date.now();
    const fromTime = from ? parseInt(from) : now - 24 * 60 * 60 * 1000; // 24h ago
    const toTime = to ? parseInt(to) : now;

    const intervalMs = {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
    }[interval] || 60 * 60 * 1000;

    let basePrice = 100 + Math.random() * 900; // Random base price

    for (let time = fromTime; time <= toTime; time += intervalMs) {
        const volatility = 0.02; // 2% volatility
        const changePercent = (Math.random() - 0.5) * volatility;

        const open = basePrice;
        const close = basePrice * (1 + changePercent);
        const high = Math.max(open, close) * (1 + Math.random() * volatility / 2);
        const low = Math.min(open, close) * (1 - Math.random() * volatility / 2);
        const volume = Math.random() * 100000 + 10000;

        data.push({
            timestamp: new Date(time),
            open,
            high,
            low,
            close,
            volume,
        });

        basePrice = close;
    }

    return data;
}

export default router;
