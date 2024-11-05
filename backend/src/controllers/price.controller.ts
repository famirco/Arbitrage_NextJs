import express from 'express';
import { priceService } from '../services/price.service';
import logger from '../utils/logger';

const router = express.Router();

// Define route handlers separately
const getAllPrices = (req: express.Request, res: express.Response) => {
    try {
        const prices = priceService.getAllPrices();
        const formattedPrices = Array.from(prices.entries()).reduce((acc, [token, rpcs]) => {
            acc[token] = Object.fromEntries(rpcs);
            return acc;
        }, {} as Record<string, any>);

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
};

const getTokenPrices = (req: express.Request, res: express.Response) => {
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
};

// Apply routes
router.get('/', getAllPrices);
router.get('/:token', getTokenPrices);

export default router;