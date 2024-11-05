import { Router } from 'express';
import { configLoader } from '../utils/config.loader';
import logger from '../utils/logger';
import type { Settings } from '../utils/config.loader';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const settings = configLoader.getSettings();
        res.json(settings);
    } catch (error) {
        logger.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// اضافه کردن endpoint برای دریافت tokens
router.get('/tokens', async (req, res) => {
    try {
        const tokens = configLoader.getTokens();
        res.json(tokens);
    } catch (error) {
        logger.error('Error fetching tokens:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// اضافه کردن endpoint برای دریافت RPCs
router.get('/rpcs', async (req, res) => {
    try {
        const rpcs = configLoader.getRpcs();
        res.json(rpcs);
    } catch (error) {
        logger.error('Error fetching RPCs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;