import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Backend v1.2.0 - Live crypto data with GeckoTerminal API
import { PrismaClient } from '@prisma/client';

// Import routes
import tokenRoutes from './routes/tokens.js';
import pairRoutes from './routes/pairs.js';
import adminRoutes from './routes/admin.js';
import portfolioRoutes from './routes/portfolio.js';
import analyticsRoutes from './routes/analytics.js';
import setupRoutes from './routes/setup.js';
import presaleRoutes from './routes/presale.js';

// Import WebSocket handler
import initializeWebSocket from './websocket/socketServer.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS properly
const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
const corsOrigin = allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(o => o.trim());

const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
    },
});

// Initialize Prisma
export const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: corsOrigin,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Wagydog Backend is running 🚀',
        endpoints: {
            health: '/api/health',
            docs: 'https://wagydog-daap.onrender.com/docs'
        }
    });
});

// API Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/pairs', pairRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/presale', presaleRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

// Initialize WebSocket
initializeWebSocket(io);

// Database initialization
async function initializeDatabase() {
    try {
        console.log('🔄 Syncing database schema...');
        await prisma.$queryRaw`SELECT 1`; // Test connection
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // Continue anyway - Prisma will handle retries
    }
}

// Start server
async function startServer() {
    // Start listening immediately
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 WebSocket server ready`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

        // Initialize database in background (non-blocking)
        initializeDatabase().catch(err => {
            console.error('Database initialization error:', err);
        });
    });
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});


// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export { io };
