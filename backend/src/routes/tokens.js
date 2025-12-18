import express from 'express';
import geckoService from '../services/geckoTerminalService.js';
import newTokenDetector from '../services/newTokenDetector.js';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * GET /api/tokens/trending
 * Get trending tokens from live API
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 24;
        const chain = req.query.chain;

        const trending = await geckoService.getTrendingPools(chain, limit);

        // Add snipe scores
        const withScores = trending.map(pool => ({
            ...pool,
            snipeScore: geckoService.calculateSnipeScore(pool),
        }));

        res.json({
            success: true,
            data: withScores,
            source: 'live',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        res.status(500).json({ error: 'Failed to fetch trending tokens' });
    }
});

/**
 * GET /api/tokens/new
 * Get newly listed tokens (live data)
 */
router.get('/new', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const chain = req.query.chain;
        const minLiquidity = parseFloat(req.query.minLiquidity) || 0;

        const newPools = await geckoService.getNewPools(chain, limit * 2);

        // Filter and add snipe scores
        const filtered = newPools
            .filter(pool => pool.liquidity >= minLiquidity)
            .map(pool => ({
                ...pool,
                snipeScore: geckoService.calculateSnipeScore(pool),
            }))
            .slice(0, limit);

        res.json({
            success: true,
            data: filtered,
            source: 'live',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching new tokens:', error);
        res.status(500).json({ error: 'Failed to fetch new tokens' });
    }
});

/**
 * GET /api/tokens/hot
 * Get "hot" tokens - high volume with recent listing
 */
router.get('/hot', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const chain = req.query.chain;

        // Get new pools with high volume
        const newPools = await geckoService.getNewPools(chain, 100);

        // Filter for hot tokens: new + high volume
        const hot = newPools
            .filter(pool => pool.volume24h > 10000 && pool.ageSeconds < 86400)
            .map(pool => ({
                ...pool,
                snipeScore: geckoService.calculateSnipeScore(pool),
                isHot: true,
            }))
            .sort((a, b) => b.volume24h - a.volume24h)
            .slice(0, limit);

        res.json({
            success: true,
            data: hot,
            source: 'live',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching hot tokens:', error);
        res.status(500).json({ error: 'Failed to fetch hot tokens' });
    }
});

/**
 * GET /api/tokens/discoveries
 * Get recently discovered new tokens from detector
 */
router.get('/discoveries', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const chain = req.query.chain;

        const discoveries = newTokenDetector.getRecentDiscoveries(limit, chain);

        res.json({
            success: true,
            data: discoveries,
            stats: newTokenDetector.getDetectorStats(),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching discoveries:', error);
        res.status(500).json({ error: 'Failed to fetch discoveries' });
    }
});

/**
 * GET /api/tokens/search
 * Search tokens by name or symbol
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 20;

        if (!query || query.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const results = await geckoService.searchTokens(query, limit);

        res.json({
            success: true,
            data: results,
            source: 'live',
        });
    } catch (error) {
        console.error('Error searching tokens:', error);
        res.status(500).json({ error: 'Failed to search tokens' });
    }
});

/**
 * GET /api/tokens/lists/gainers
 * Get top gainers in last 24h
 */
router.get('/lists/gainers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const chain = req.query.chain || 'ethereum';

        const gainers = await geckoService.getTopGainers(chain, limit);

        res.json({
            success: true,
            data: gainers,
            source: 'live',
        });
    } catch (error) {
        console.error('Error fetching gainers:', error);
        res.status(500).json({ error: 'Failed to fetch gainers' });
    }
});

/**
 * GET /api/tokens/lists/losers
 * Get top losers in last 24h
 */
router.get('/lists/losers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const chain = req.query.chain || 'ethereum';

        const losers = await geckoService.getTopLosers(chain, limit);

        res.json({
            success: true,
            data: losers,
            source: 'live',
        });
    } catch (error) {
        console.error('Error fetching losers:', error);
        res.status(500).json({ error: 'Failed to fetch losers' });
    }
});

/**
 * GET /api/tokens/:address
 * Get token details by address
 * NOTE: This MUST be the LAST route to avoid matching static paths
 */
router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const chain = req.query.chain || 'ethereum';

        // Try to get from live API
        const tokenInfo = await geckoService.getTokenInfo(chain, address);

        if (tokenInfo) {
            // Increment view count in analytics (async)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            prisma.siteAnalytics.upsert({
                where: { date: today },
                create: { date: today, pageViews: 1 },
                update: { pageViews: { increment: 1 } },
            }).catch(console.error);

            return res.json({
                success: true,
                data: tokenInfo,
                source: 'live',
            });
        }

        // Fallback to database
        const token = await prisma.token.findUnique({
            where: { address },
        });

        if (!token) {
            return res.status(404).json({ error: 'Token not found' });
        }

        res.json({
            success: true,
            data: token,
            source: 'database',
        });
    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).json({ error: 'Failed to fetch token' });
    }
});

export default router;
