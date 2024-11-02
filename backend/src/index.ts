import express from 'express';
import http from 'http';
import cors from 'cors';
import statusRouter from './controllers/status.controller';
import tradeRouter from './controllers/trade.controller';
import priceRouter from './controllers/price.controller';
import { createWebSocketService } from './services/websocket.service';
import { rpcService } from './services/rpc.service';
import { priceService } from './services/price.service';
import { arbitrageService } from './services/arbitrage.service';
import { tradeService } from './services/trade.service';
import { telegramService } from './services/telegram.service';
import logger from './utils/logger';

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
createWebSocketService(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/status', statusRouter);
app.use('/api/trades', tradeRouter);
app.use('/api/prices', priceRouter);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down...');
    
    server.close(() => {
        logger.info('HTTP server closed');
    });

    // Stop all services
    rpcService.stop();
    priceService.stop();
    arbitrageService.stop();
    tradeService.stop();
    
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
