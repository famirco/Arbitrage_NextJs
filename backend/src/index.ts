import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { rpcService } from './services/rpc.service';
import { priceService } from './services/price.service';
import { arbitrageService } from './services/arbitrage.service';
import { tradeService } from './services/trade.service';
import { configLoader } from './utils/config.loader';
import tradeRoutes from './controllers/trade.controller';
import priceRoutes from './controllers/price.controller';
import statusRoutes from './controllers/status.controller';
import logger from './utils/logger';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/trades', tradeRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/status', statusRoutes);

// WebSocket connection handling
wss.on('connection', (ws) => {
    logger.info('New WebSocket connection');

    ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        logger.info('Client disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Starting graceful shutdown...');
    
    wss.close(() => {
        logger.info('WebSocket server closed');
        
        server.close(() => {
            logger.info('HTTP server closed');
            
            // Stop services
            rpcService.stop();
            priceService.stop();
            arbitrageService.stop();
            tradeService.stop();
            
            process.exit(0);
        });
    });
});

export default app;