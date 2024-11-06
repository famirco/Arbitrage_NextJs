import express from 'express';
import { rpcService } from '../services/rpc.service';
import { configLoader } from '../utils/config.loader';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const rpcs = configLoader.getRpcs();
        const tokens = configLoader.getTokens();
        
        // دریافت آخرین تریدها
        const latestTrades = await prisma.trade.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
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
                    list: rpcs.map(rpc => ({
                        name: rpc.name
                    }))
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