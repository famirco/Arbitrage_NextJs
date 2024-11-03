import { Router } from 'express';
import logger from '../utils/logger';  // مسیر درست

const router = Router();

router.get('/', async (req, res) => {
    try {
        res.json({
            status: 'success',
            data: {
                settings: {
                    enabled: true,
                }
            }
        });
    } catch (error) {
        logger.error('Error getting settings:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error'
        });
    }
});

export default router;