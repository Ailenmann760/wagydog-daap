import express from 'express';
import { prisma } from '../server.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/portfolio/:walletAddress
 * Get portfolio for a wallet address
 */
router.get('/:walletAddress', optionalAuth, async (req, res) => {
    try {
        const { walletAddress } = req.params;

        // In production, fetch real wallet data from blockchain
        // For now, return mock portfolio data
        const mockPortfolio = {
            walletAddress,
            totalValueUSD: Math.random() * 100000 + 1000,
            tokens: [
                {
                    address: '0x....',
                    symbol: 'WETH',
                    balance: '1.5',
                    valueUSD: 3000,
                    priceUSD: 2000,
                    change24h: 2.5,
                },
                {
                    address: '0x....',
                    symbol: 'USDC',
                    balance: '5000',
                    valueUSD: 5000,
                    priceUSD: 1,
                    change24h: 0.01,
                },
            ],
        };

        res.json({
            success: true,
            data: mockPortfolio,
            isMock: true,
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

/**
 * GET /api/portfolio/:walletAddress/watchlist
 * Get user's watchlist
 */
router.get('/:walletAddress/watchlist', authenticateUser, async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                walletAddresses: {
                    has: req.params.walletAddress,
                },
            },
            include: {
                watchlists: {
                    include: {
                        token: {
                            include: {
                                pairs: {
                                    take: 1,
                                    orderBy: { volume24h: 'desc' },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            data: user.watchlists,
        });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

/**
 * POST /api/portfolio/watchlist/:tokenId
 * Add token to watchlist
 */
router.post('/watchlist/:tokenId', authenticateUser, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const userId = req.user.id;

        const watchlistItem = await prisma.watchList.create({
            data: {
                userId,
                tokenId,
            },
            include: {
                token: true,
            },
        });

        res.json({
            success: true,
            data: watchlistItem,
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Token already in watchlist' });
        }
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

/**
 * DELETE /api/portfolio/watchlist/:tokenId
 * Remove token from watchlist
 */
router.delete('/watchlist/:tokenId', authenticateUser, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const userId = req.user.id;

        await prisma.watchList.delete({
            where: {
                userId_tokenId: {
                    userId,
                    tokenId,
                },
            },
        });

        res.json({
            success: true,
            message: 'Removed from watchlist',
        });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

export default router;
