import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * POST /api/setup/admin
 * One-time admin setup - creates the initial admin user
 * This should be disabled or removed after first use in production
 */
router.post('/admin', async (req, res) => {
    try {
        const { email, password, setupKey } = req.body;

        // Simple setup key protection - should match env variable
        const expectedKey = process.env.SETUP_KEY || 'wagydog-setup-2024';
        if (setupKey !== expectedKey) {
            return res.status(403).json({ error: 'Invalid setup key' });
        }

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if admin already exists
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (existingAdmin) {
            return res.status(400).json({
                error: 'Admin already exists. Use the normal login.'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: 'ADMIN',
            },
        });

        console.log('✅ Admin user created:', email);

        res.json({
            success: true,
            message: 'Admin user created successfully',
            user: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Error creating admin:', error);

        // Handle unique constraint error
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }

        res.status(500).json({ error: 'Failed to create admin user' });
    }
});

/**
 * GET /api/setup/status
 * Check if initial setup is complete
 */
router.get('/status', async (req, res) => {
    try {
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' }
        });

        res.json({
            success: true,
            data: {
                hasAdmin: adminCount > 0,
                isSetupComplete: adminCount > 0,
            },
        });
    } catch (error) {
        console.error('Error checking setup status:', error);
        res.status(500).json({ error: 'Failed to check setup status' });
    }
});

export default router;
