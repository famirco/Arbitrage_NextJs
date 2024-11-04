import { Router } from 'express';
import { configLoader } from '../utils/config.loader';
import logger from '../utils/logger';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const settings = await configLoader.getConfig();
        res.json(settings);
    } catch (error) {
        logger.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;