import WebSocket from 'ws';
import { Server } from 'http';
import { priceService } from './price.service';
import { arbitrageService } from './arbitrage.service';
import { rpcService } from './rpc.service';
import logger from '../utils/logger';

class WebSocketService {
    private wss: WebSocket.Server;
    private clients: Set<WebSocket> = new Set();

    constructor(server: Server) {
        this.wss = new WebSocket.Server({ server });
        this.initialize();
    }

    private initialize() {
        this.wss.on('connection', (ws: WebSocket) => {
            this.clients.add(ws);
            logger.info('New WebSocket client connected');

            ws.on('close', () => {
                this.clients.delete(ws);
                logger.info('WebSocket client disconnected');
            });

            ws.on('error', (error) => {
                logger.error('WebSocket error:', error);
            });
        });

        this.setupListeners();
    }

    private setupListeners() {
        // Listen for price updates
        priceService.on('priceUpdate', (data) => {
            this.broadcast('price', data);
        });

        // Listen for arbitrage opportunities
        arbitrageService.on('opportunity', (data) => {
            this.broadcast('opportunity', data);
        });

        // Listen for RPC status changes
        rpcService.on('rpcStatus', (data) => {
            this.broadcast('rpcStatus', data);
        });
    }

    private broadcast(type: string, data: any) {
        const message = JSON.stringify({ type, data });
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    public stop() {
        this.wss.close(() => {
            logger.info('WebSocket server closed');
        });
    }
}

export const createWebSocketService = (server: Server) => {
    return new WebSocketService(server);
};
