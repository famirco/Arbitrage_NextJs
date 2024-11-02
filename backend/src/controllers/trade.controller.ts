import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const router = Router();

interface TradeQuery {
    page?: string;
    limit?: string;
    status?: string;
}

interface TradeParams {
    id: string;
}

// Get all trades with pagination
router.get('/', async (req: Request<{}, {}, {}, TradeQuery>, res: Response) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const status = req.query.status;
        const skip = (page - 1) * limit;

        const where = status ? { status } : {};

        const trades = await prisma.trade.findMany({
            where,
            take: limit,
            skip,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const total = await prisma.trade.count({ where });

        res.json({
            success: true,
            data: trades,
            pagination: {
                page,
                limit,
                total
            }
        });
    } catch (error) {
        logger.error('Error getting trades:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get single trade by ID
router.get('/:id', async (req: Request<TradeParams>, res: Response) => {
    try {
        const tradeId = parseInt(req.params.id);
        
        const trade = await prisma.trade.findUnique({
            where: {
                id: tradeId
            }
        });

        if (!trade) {
            return res.status(404).json({
                success: false,
                error: 'Trade not found'
            });
        }

        res.json({
            success: true,
            data: trade
        });
    } catch (error) {
        logger.error('Error getting trade:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;