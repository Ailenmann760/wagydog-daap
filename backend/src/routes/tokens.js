import express from 'express';
import { prisma } from '../server.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/tokens/trending
 * Get trending tokens
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 24;
        const chain = req.query.chain;

        const trending = await prisma.trendingToken.findMany({
            take: limit,
            orderBy: { rank: 'asc' },
            where: {
                timestamp: {
                    gte: new Date(Date.now() - 1000 * 60 * 30), // Last 30 minutes
                },
                ...(chain && { token: { chain } }),
            },
            include: {
                token: true,
            },
        });

        res.json({
            success: true,
            data: trending.map(t => ({
                rank: t.rank,
                score: t.score,
                token: t.token,
                mainPair: null, // Simplified for SQLite
            })),
        });
    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        res.status(500).json({ error: 'Failed to fetch trending tokens' });
    }
});

/**
 * GET /api/tokens/new
 * Get newly listed tokens
 */
router.get('/new', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const chain = req.query.chain;

        const newTokens = await prisma.token.findMany({
            take: limit,
            where: {
                isApproved: true,
                isScam: false,
                ...(chain && { chain }),
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: newTokens,
        });
    } catch (error) {
        console.error('Error fetching new tokens:', error);
        res.status(500).json({ error: 'Failed to fetch new tokens' });
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

        const tokens = await prisma.token.findMany({
            take: limit,
            where: {
                isApproved: true,
                isScam: false,
                OR: [
                    { name: { contains: query } },
                    { symbol: { contains: query } },
                    { address: { contains: query } },
                ],
            },
            orderBy: [
                { isFeatured: 'desc' },
                { marketCap: 'desc' },
            ],
        });

        res.json({
            success: true,
            data: tokens,
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
        const chain = req.query.chain;

        // Get tokens
        const tokens = await prisma.token.findMany({
            where: {
                isApproved: true,
                isScam: false,
                ...(chain && { chain }),
            },
            take: limit * 3, // Get more to filter
        });

        // For each token, find best performing pair
        const tokensWithChange = await Promise.all(
            tokens.map(async (token) => {
                const pairs = await prisma.pair.findMany({
                    where: {
                        OR: [
                            { tokenAId: token.id },
                            { tokenBId: token.id },
                        ],
                        priceChange24h: { gt: 0 },
                    },
                    orderBy: { priceChange24h: 'desc' },
                    take: 1,
                });

                return {
                    ...token,
                    pairs,
                    priceChange: pairs[0]?.priceChange24h || 0,
                };
            })
        );

        // Sort and limit
        const sorted = tokensWithChange
            .filter(t => t.priceChange > 0)
            .sort((a, b) => b.priceChange - a.priceChange)
            .slice(0, limit);

        res.json({
            success: true,
            data: sorted,
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
        const chain = req.query.chain;

        // Get tokens
        const tokens = await prisma.token.findMany({
            where: {
                isApproved: true,
                isScam: false,
                ...(chain && { chain }),
            },
            take: limit * 3,
        });

        // For each token, find worst performing pair
        const tokensWithChange = await Promise.all(
            tokens.map(async (token) => {
                const pairs = await prisma.pair.findMany({
                    where: {
                        OR: [
                            { tokenAId: token.id },
                            { tokenBId: token.id },
                        ],
                        priceChange24h: { lt: 0 },
                    },
                    orderBy: { priceChange24h: 'asc' },
                    take: 1,
                });

                return {
                    ...token,
                    pairs,
                    priceChange: pairs[0]?.priceChange24h || 0,
                };
            })
        );

        // Sort and limit
        const sorted = tokensWithChange
            .filter(t => t.priceChange < 0)
            .sort((a, b) => a.priceChange - b.priceChange)
            .slice(0, limit);

        res.json({
            success: true,
            data: sorted,
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

        const token = await prisma.token.findUnique({
            where: { address },
        });

        if (!token) {
            return res.status(404).json({ error: 'Token not found' });
        }

        // Get pairs separately
        const pairsA = await prisma.pair.findMany({
            where: { tokenAId: token.id },
            orderBy: { volume24h: 'desc' },
            take: 5,
        });

        const pairsB = await prisma.pair.findMany({
            where: { tokenBId: token.id },
            orderBy: { volume24h: 'desc' },
            take: 5,
        });

        const allPairs = [...pairsA, ...pairsB].sort((a, b) => b.volume24h - a.volume24h);

        // Increment view count in analytics (async, don't wait)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        prisma.siteAnalytics.upsert({
            where: { date: today },
            create: { date: today, pageViews: 1 },
            update: { pageViews: { increment: 1 } },
        }).catch(console.error);

        res.json({
            success: true,
            data: {
                ...token,
                pairs: allPairs,
                _count: { watchlists: 0 },
            },
        });
    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).json({ error: 'Failed to fetch token' });
    }
});

export default router;
