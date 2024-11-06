import express from 'express';
import { rpcService } from '../services/rpc.service';
import { configLoader } from '../utils/config.loader';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import { web3Alchemy, web3Infura } from '../services/web3.service';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const rpcs = configLoader.getRpcs();
        const tokens = configLoader.getTokens();
        
        // بررسی وضعیت اتصال Web3
        const alchemyConnected = await web3Alchemy.eth.net.isListening();
        const infuraConnected = await web3Infura.eth.net.isListening();

        // دریافت آخرین تریدها
        const latestTrades = await prisma.trade.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                status: true,
                amount: true,
                profit: true,
                createdAt: true
            }
        });

        res.json({
            success: true,
            data: {
                status: 'running',
                rpcs: {
                    count: rpcs.length,
                    connections: {
                        alchemy: alchemyConnected ? 'connected' : 'disconnected',
                        infura: infuraConnected ? 'connected' : 'disconnected'
                    }
                },
                tokens: tokens.length,
                lastTrades: latestTrades,
                lastCheck: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error('Error getting system status:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;