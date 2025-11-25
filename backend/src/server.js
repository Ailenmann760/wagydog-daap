import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import tokenRoutes from './routes/tokens.js';
import pairRoutes from './routes/pairs.js';
import adminRoutes from './routes/admin.js';
import portfolioRoutes from './routes/portfolio.js';
import analyticsRoutes from './routes/analytics.js';

// Import WebSocket handler
import initializeWebSocket from './websocket/socketServer.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST'],
    },
});

// Initialize Prisma
export const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
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

// API Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/pairs', pairRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/analytics', analyticsRoutes);

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

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
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
