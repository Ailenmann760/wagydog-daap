import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'changeme123', 10);

    const admin = await prisma.user.upsert({
        where: { email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@wagydog.com' },
        update: {},
        create: {
            email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@wagydog.com',
            passwordHash: adminPassword,
            role: 'SUPER_ADMIN',
            walletAddresses: '[]'
        },
    });

    console.log('✅ Created admin user:', admin.email);

    // Create sample tokens
    const tokens = [];
    const tokenData = [
        { name: 'Ethereum', symbol: 'ETH', chain: 'ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg' },
        { name: 'USD Coin', symbol: 'USDC', chain: 'ethereum', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg' },
        { name: 'Tether USD', symbol: 'USDT', chain: 'ethereum', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg' },
        { name: 'Binance Coin', symbol: 'BNB', chain: 'bsc', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bnb.svg' },
        { name: 'Polygon', symbol: 'MATIC', chain: 'polygon', address: '0x0000000000000000000000000000000000001010', logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg' },
    ];

    for (const data of tokenData) {
        const token = await prisma.token.upsert({
            where: { address: data.address },
            update: {},
            create: {
                ...data,
                isApproved: true,
                isFeatured: Math.random() > 0.5,
                marketCap: Math.random() * 10000000000 + 1000000000,
                fdv: Math.random() * 15000000000 + 1000000000,
                tags: JSON.stringify(['Layer 1', 'Infrastructure'])
            },
        });
        tokens.push(token);
        console.log(`✅ Created token: ${token.symbol}`);
    }

    // Create sample pairs
    const pairs = [];
    for (let i = 0; i < tokens.length - 1; i++) {
        const tokenA = tokens[i];
        const tokenB = tokens[i + 1];

        const pair = await prisma.pair.create({
            data: {
                pairAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
                tokenAId: tokenA.id,
                tokenBId: tokenB.id,
                dexName: ['Uniswap V3', 'PancakeSwap', 'QuickSwap'][Math.floor(Math.random() * 3)],
                chain: tokenA.chain,
                priceUSD: Math.random() * 1000 + 10,
                priceNative: Math.random() * 0.5 + 0.1,
                liquidity: Math.random() * 5000000 + 100000,
                volume24h: Math.random() * 1000000 + 50000,
                volume7d: Math.random() * 7000000 + 350000,
                priceChange24h: (Math.random() - 0.5) * 20,
                priceChange7d: (Math.random() - 0.5) * 50,
            },
        });
        pairs.push(pair);
        console.log(`✅ Created pair: ${tokenA.symbol}/${tokenB.symbol}`);
    }

    // Create trending tokens
    for (let i = 0; i < Math.min(10, tokens.length); i++) {
        await prisma.trendingToken.create({
            data: {
                tokenId: tokens[i].id,
                rank: i + 1,
                score: 1000 - i * 50,
            },
        });
    }
    console.log('✅ Created trending tokens');

    // Create sample trades
    for (const pair of pairs.slice(0, 3)) {
        for (let i = 0; i < 20; i++) {
            await prisma.trade.create({
                data: {
                    pairId: pair.id,
                    type: Math.random() > 0.5 ? 'BUY' : 'SELL',
                    amountUSD: Math.random() * 10000 + 100,
                    amountToken: String(Math.random() * 100 + 1),
                    priceUSD: pair.priceUSD * (1 + (Math.random() - 0.5) * 0.02),
                    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
                    timestamp: new Date(Date.now() - Math.random() * 3600000),
                },
            });
        }
    }
    console.log('✅ Created sample trades');

    // Create analytics data
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        await prisma.siteAnalytics.upsert({
            where: { date },
            update: {},
            create: {
                date,
                pageViews: Math.floor(Math.random() * 10000) + 1000,
                uniqueVisitors: Math.floor(Math.random() * 3000) + 500,
                searches: Math.floor(Math.random() * 500) + 100,
                topTokens: JSON.stringify([]),
                topPairs: JSON.stringify([])
            },
        });
    }
    console.log('✅ Created analytics data');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
