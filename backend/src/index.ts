import settingsController from './controllers/settings.controller';
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
app.use(cors({
    origin: ['http://amirez.info', 'https://amirez.info'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/settings', settingsController);

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
const PORT = 3001;  

server.listen(PORT, '0.0.0.0', () => {
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