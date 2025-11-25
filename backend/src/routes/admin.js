import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/admin/login
 * Admin login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Log admin login
        await prisma.adminLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                details: { ip: req.ip },
            },
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/admin/dashboard
 * Admin dashboard stats
 */
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        const [
            totalTokens,
            pendingTokens,
            featuredTokens,
            totalPairs,
            totalUsers,
            todayAnalytics,
        ] = await Promise.all([
            prisma.token.count(),
            prisma.token.count({ where: { isApproved: false } }),
            prisma.token.count({ where: { isFeatured: true } }),
            prisma.pair.count(),
            prisma.user.count(),
            prisma.siteAnalytics.findUnique({
                where: {
                    date: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                tokens: { total: totalTokens, pending: pendingTokens, featured: featuredTokens },
                pairs: { total: totalPairs },
                users: { total: totalUsers },
                today: todayAnalytics || { pageViews: 0, uniqueVisitors: 0, searches: 0 },
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

/**
 * GET /api/admin/tokens/pending
 * Get tokens pending approval
 */
router.get('/tokens/pending', authenticateAdmin, async (req, res) => {
    try {
        const pendingTokens = await prisma.token.findMany({
            where: { isApproved: false },
            orderBy: { createdAt: 'desc' },
            include: {
                pairs: { take: 1, orderBy: { volume24h: 'desc' } },
            },
        });

        res.json({ success: true, data: pendingTokens });
    } catch (error) {
        console.error('Error fetching pending tokens:', error);
        res.status(500).json({ error: 'Failed to fetch pending tokens' });
    }
});

/**
 * POST /api/admin/tokens/:id/approve
 * Approve a token
 */
router.post('/tokens/:id/approve', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const token = await prisma.token.update({
            where: { id },
            data: { isApproved: true },
        });

        await prisma.adminLog.create({
            data: {
                userId: req.user.id,
                action: 'APPROVE_TOKEN',
                details: { tokenId: id, tokenAddress: token.address },
            },
        });

        res.json({ success: true, data: token });
    } catch (error) {
        console.error('Error approving token:', error);
        res.status(500).json({ error: 'Failed to approve token' });
    }
});

/**
 * POST /api/admin/tokens/:id/feature
 * Feature/unfeature a token
 */
router.post('/tokens/:id/feature', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { featured } = req.body;

        const token = await prisma.token.update({
            where: { id },
            data: { isFeatured: featured === true },
        });

        await prisma.adminLog.create({
            data: {
                userId: req.user.id,
                action: featured ? 'FEATURE_TOKEN' : 'UNFEATURE_TOKEN',
                details: { tokenId: id },
            },
        });

        res.json({ success: true, data: token });
    } catch (error) {
        console.error('Error featuring token:', error);
        res.status(500).json({ error: 'Failed to feature token' });
    }
});

/**
 * PUT /api/admin/tokens/:id
 * Update token metadata
 */
router.put('/tokens/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Only allow updating specific fields
        const allowedFields = ['name', 'symbol', 'logoUrl', 'description', 'website', 'twitter', 'telegram', 'discord', 'tags', 'warningNote', 'isScam'];
        const filteredUpdates = {};

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        const token = await prisma.token.update({
            where: { id },
            data: filteredUpdates,
        });

        await prisma.adminLog.create({
            data: {
                userId: req.user.id,
                action: 'UPDATE_TOKEN',
                details: { tokenId: id, updates: filteredUpdates },
            },
        });

        res.json({ success: true, data: token });
    } catch (error) {
        console.error('Error updating token:', error);
        res.status(500).json({ error: 'Failed to update token' });
    }
});

/**
 * DELETE /api/admin/tokens/:id
 * Delete/hide a token
 */
router.delete('/tokens/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete by marking as scam
        const token = await prisma.token.update({
            where: { id },
            data: { isScam: true, isApproved: false, isFeatured: false },
        });

        await prisma.adminLog.create({
            data: {
                userId: req.user.id,
                action: 'DELETE_TOKEN',
                details: { tokenId: id },
            },
        });

        res.json({ success: true, data: token });
    } catch (error) {
        console.error('Error deleting token:', error);
        res.status(500).json({ error: 'Failed to delete token' });
    }
});

/**
 * GET /api/admin/analytics
 * Get site analytics
 */
router.get('/analytics', authenticateAdmin, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const analytics = await prisma.siteAnalytics.findMany({
            where: {
                date: { gte: fromDate },
            },
            orderBy: { date: 'asc' },
        });

        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                walletAddresses: true,
                createdAt: true,
                _count: {
                    select: { watchlists: true, adminLogs: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/admin/logs
 * Get admin activity logs
 */
router.get('/logs', authenticateAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;

        const logs = await prisma.adminLog.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: { email: true, role: true },
                },
            },
        });

        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

export default router;
