import express from 'express';
import geckoService from '../services/geckoTerminalService.js';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * GET /api/pairs/trending
 * Get trending pairs from live API
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const chain = req.query.chain;

        const trending = await geckoService.getTrendingPools(chain, limit);

        res.json({
            success: true,
            data: trending,
            source: 'live',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching trending pairs:', error);
        res.status(500).json({ error: 'Failed to fetch trending pairs' });
    }
});

/**
 * GET /api/pairs/new
 * Get newly created pairs
 */
router.get('/new', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const chain = req.query.chain;

        const newPools = await geckoService.getNewPools(chain, limit);

        res.json({
            success: true,
            data: newPools,
            source: 'live',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching new pairs:', error);
        res.status(500).json({ error: 'Failed to fetch new pairs' });
    }
});

/**
 * GET /api/pairs/:chain/:pairAddress
 * Get pair details from live API
 */
router.get('/:chain/:pairAddress', async (req, res) => {
    try {
        const { chain, pairAddress } = req.params;

        const poolData = await geckoService.getPoolDetails(chain, pairAddress);

        if (!poolData) {
            return res.status(404).json({ error: 'Pair not found' });
        }

        res.json({
            success: true,
            data: poolData,
            source: 'live',
        });
    } catch (error) {
        console.error('Error fetching pair:', error);
        res.status(500).json({ error: 'Failed to fetch pair' });
    }
});

/**
 * GET /api/pairs/:chain/:pairAddress/chart
 * Get OHLCV chart data from live API
 */
router.get('/:chain/:pairAddress/chart', async (req, res) => {
    try {
        const { chain, pairAddress } = req.params;
        const { interval = 'hour', aggregate = 1 } = req.query;

        // Map interval names
        const timeframeMap = {
            '1m': { timeframe: 'minute', aggregate: 1 },
            '5m': { timeframe: 'minute', aggregate: 5 },
            '15m': { timeframe: 'minute', aggregate: 15 },
            '1h': { timeframe: 'hour', aggregate: 1 },
            '4h': { timeframe: 'hour', aggregate: 4 },
            '1d': { timeframe: 'day', aggregate: 1 },
            'minute': { timeframe: 'minute', aggregate: parseInt(aggregate) || 1 },
            'hour': { timeframe: 'hour', aggregate: parseInt(aggregate) || 1 },
            'day': { timeframe: 'day', aggregate: parseInt(aggregate) || 1 },
        };

        const config = timeframeMap[interval] || timeframeMap['1h'];

        const chartData = await geckoService.getPoolOHLCV(
            chain,
            pairAddress,
            config.timeframe,
            config.aggregate
        );

        if (chartData.length === 0) {
            // Generate mock data as fallback
            const mockData = generateMockChartData(interval);
            return res.json({
                success: true,
                data: mockData,
                source: 'mock',
            });
        }

        res.json({
            success: true,
            data: chartData,
            source: 'live',
            interval: interval,
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

/**
 * GET /api/pairs/:pairAddress (legacy - tries multiple chains)
 * Get pair details by address only
 */
router.get('/:pairAddress', async (req, res) => {
    try {
        const { pairAddress } = req.params;
        const chains = ['ethereum', 'bsc', 'solana', 'base', 'arbitrum'];

        // Try each chain until we find the pair
        for (const chain of chains) {
            const poolData = await geckoService.getPoolDetails(chain, pairAddress);
            if (poolData) {
                return res.json({
                    success: true,
                    data: poolData,
                    source: 'live',
                });
            }
        }

        // Fallback to database
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
            source: 'database',
        });
    } catch (error) {
        console.error('Error fetching pair:', error);
        res.status(500).json({ error: 'Failed to fetch pair' });
    }
});

/**
 * Helper function to generate mock chart data
 */
function generateMockChartData(interval) {
    const data = [];
    const now = Date.now();

    const intervalMs = {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
    }[interval] || 60 * 60 * 1000;

    const points = 100;
    let basePrice = 0.001 + Math.random() * 0.1;

    for (let i = points; i >= 0; i--) {
        const time = Math.floor((now - i * intervalMs) / 1000);
        const volatility = 0.02;
        const changePercent = (Math.random() - 0.5) * volatility;

        const open = basePrice;
        const close = basePrice * (1 + changePercent);
        const high = Math.max(open, close) * (1 + Math.random() * volatility / 2);
        const low = Math.min(open, close) * (1 - Math.random() * volatility / 2);
        const volume = Math.random() * 100000 + 10000;

        data.push({
            time,
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
