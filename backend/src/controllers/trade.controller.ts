import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '10', status } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where = status ? { status: status as string } : {};

        const trades = await prisma.trade.findMany({
            where,
            take: parseInt(limit as string),
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
                page: parseInt(page as string),
                limit: parseInt(limit as string),
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

router.get('/:id', async (req, res) => {
    try {
        const trade = await prisma.trade.findUnique({
            where: {
                id: parseInt(req.params.id)
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
