import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();

// Get all trades with pagination
router.get('/', (req, res) => {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    prisma.trade.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
            createdAt: 'desc'
        }
    })
    .then(trades => {
        return prisma.trade.count({ where })
            .then(total => {
                res.json({
                    success: true,
                    data: trades,
                    pagination: {
                        page,
                        limit,
                        total
                    }
                });
            });
    })
    .catch(error => {
        logger.error('Error getting trades:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    });
});

// Get single trade by ID
router.get('/:id', (req, res) => {
    const tradeId = parseInt(req.params.id);
    
    prisma.trade.findUnique({
        where: {
            id: tradeId
        }
    })
    .then(trade => {
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
    })
    .catch(error => {
        logger.error('Error getting trade:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    });
});

export default router;