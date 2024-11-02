import { Router } from 'express';
import { priceService } from '../services/price.service';
import logger from '../utils/logger';

const router = Router();

router.get('/', (req, res) => {
    try {
        const prices = priceService.getAllPrices();
        const formattedPrices = Array.from(prices.entries()).reduce((acc, [token, rpcs]) => {
            acc[token] = Object.fromEntries(rpcs);
            return acc;
        }, {} as any);

        res.json({
            success: true,
            data: formattedPrices
        });
    } catch (error) {
        logger.error('Error getting prices:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

router.get('/:token', (req, res) => {
    try {
        const prices = priceService.getPrices(req.params.token);
        if (!prices) {
            return res.status(404).json({
                success: false,
                error: 'Token not found'
            });
        }

        res.json({
            success: true,
            data: Object.fromEntries(prices)
        });
    } catch (error) {
        logger.error('Error getting token prices:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
