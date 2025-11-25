import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * GET /api/analytics/overview
 * Get general platform analytics
 */
router.get('/overview', async (req, res) => {
    try {
        const [tokenCount, pairCount, recentAnalytics] = await Promise.all([
            prisma.token.count({ where: { isApproved: true, isScam: false } }),
            prisma.pair.count(),
            prisma.siteAnalytics.findFirst({
                orderBy: { date: 'desc' },
            }),
        ]);

        // Calculate total volume across all pairs
        const volumeData = await prisma.pair.aggregate({
            _sum: {
                volume24h: true,
                liquidity: true,
            },
        });

        res.json({
            success: true,
            data: {
                totalTokens: tokenCount,
                totalPairs: pairCount,
                total24hVolume: volumeData._sum.volume24h || 0,
                totalLiquidity: volumeData._sum.liquidity || 0,
                todayPageViews: recentAnalytics?.pageViews || 0,
                todaySearches: recentAnalytics?.searches || 0,
            },
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * POST /api/analytics/track
 * Track an analytics event (page view, search, etc.)
 */
router.post('/track', async (req, res) => {
    try {
        const { eventType, data } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Update or create today's analytics
        if (eventType === 'pageview') {
            await prisma.siteAnalytics.upsert({
                where: { date: today },
                create: { date: today, pageViews: 1, uniqueVisitors: 0, searches: 0 },
                update: { pageViews: { increment: 1 } },
            });
        } else if (eventType === 'search') {
            await prisma.siteAnalytics.upsert({
                where: { date: today },
                create: { date: today, pageViews: 0, uniqueVisitors: 0, searches: 1 },
                update: { searches: { increment: 1 } },
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking analytics:', error);
        // Don't fail the request if analytics tracking fails
        res.json({ success: true });
    }
});

export default router;
