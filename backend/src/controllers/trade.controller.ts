import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const router = Router();

// Get all trades with pagination
const getAllTrades: RequestHandler = async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const status = req.query.status as string;
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
};

// Get single trade by ID
const getTradeById: RequestHandler = async (req, res) => {
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
};

// Routes
router.get('/', getAllTrades);
router.get('/:id', getTradeById);

export default router;