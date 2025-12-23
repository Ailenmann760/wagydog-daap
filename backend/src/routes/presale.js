import express from 'express';
import axios from 'axios';

const router = express.Router();

// Config
const PRESALE_WALLET = process.env.PRESALE_WALLET || '0xb50ea4506b9a7d41c1bdb650bd0b00487fb6daf0';
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY;
const BNB_PRICE_USD = 300; // Could fetch live from CoinGecko

// Cache for presale stats
let statsCache = {
    totalBnb: '0',
    totalUsd: 0,
    contributorCount: 0,
    lastUpdated: 0
};

// Get presale wallet balance from BSCScan
async function getWalletBalance() {
    try {
        const response = await axios.get('https://api.bscscan.com/api', {
            params: {
                module: 'account',
                action: 'balance',
                address: PRESALE_WALLET,
                tag: 'latest',
                apikey: BSCSCAN_API_KEY
            }
        });

        if (response.data.status === '1') {
            const balanceWei = response.data.result;
            const balanceBnb = parseFloat(balanceWei) / 1e18;
            return balanceBnb;
        }
        return 0;
    } catch (error) {
        console.error('Error fetching wallet balance:', error.message);
        return 0;
    }
}

// Get transaction count (contributor estimate)
async function getTransactionCount() {
    try {
        const response = await axios.get('https://api.bscscan.com/api', {
            params: {
                module: 'account',
                action: 'txlist',
                address: PRESALE_WALLET,
                startblock: 0,
                endblock: 99999999,
                sort: 'desc',
                apikey: BSCSCAN_API_KEY
            }
        });

        if (response.data.status === '1' && Array.isArray(response.data.result)) {
            // Filter incoming transactions only
            const incomingTxs = response.data.result.filter(
                tx => tx.to && tx.to.toLowerCase() === PRESALE_WALLET.toLowerCase() && parseFloat(tx.value) > 0
            );
            return incomingTxs.length;
        }
        return 0;
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        return 0;
    }
}

// GET /api/presale/stats - Get presale statistics
router.get('/stats', async (req, res) => {
    try {
        const now = Date.now();

        // Cache for 30 seconds
        if (now - statsCache.lastUpdated < 30000 && statsCache.totalBnb !== '0') {
            return res.json(statsCache);
        }

        const [balanceBnb, contributorCount] = await Promise.all([
            getWalletBalance(),
            getTransactionCount()
        ]);

        const totalUsd = balanceBnb * BNB_PRICE_USD;

        statsCache = {
            totalBnb: balanceBnb.toFixed(4),
            totalUsd: Math.round(totalUsd),
            contributorCount,
            lastUpdated: now
        };

        res.json(statsCache);
    } catch (error) {
        console.error('Presale stats error:', error);
        res.status(500).json({ error: 'Failed to fetch presale stats' });
    }
});

// GET /api/presale/transactions - Get recent transactions
router.get('/transactions', async (req, res) => {
    try {
        const response = await axios.get('https://api.bscscan.com/api', {
            params: {
                module: 'account',
                action: 'txlist',
                address: PRESALE_WALLET,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 20,
                sort: 'desc',
                apikey: BSCSCAN_API_KEY
            }
        });

        if (response.data.status === '1') {
            const transactions = response.data.result
                .filter(tx => tx.to && tx.to.toLowerCase() === PRESALE_WALLET.toLowerCase())
                .map(tx => ({
                    hash: tx.hash,
                    from: tx.from,
                    value: (parseFloat(tx.value) / 1e18).toFixed(4),
                    timestamp: new Date(tx.timeStamp * 1000).toISOString()
                }));

            return res.json({ transactions });
        }

        res.json({ transactions: [] });
    } catch (error) {
        console.error('Presale transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// GET /api/presale/verify/:txHash - Verify a specific transaction
router.get('/verify/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params;

        const response = await axios.get('https://api.bscscan.com/api', {
            params: {
                module: 'transaction',
                action: 'gettxreceiptstatus',
                txhash: txHash,
                apikey: BSCSCAN_API_KEY
            }
        });

        if (response.data.status === '1' && response.data.result.status === '1') {
            return res.json({ verified: true, status: 'confirmed' });
        }

        res.json({ verified: false, status: 'pending or failed' });
    } catch (error) {
        console.error('Transaction verification error:', error);
        res.status(500).json({ error: 'Failed to verify transaction' });
    }
});

export default router;
