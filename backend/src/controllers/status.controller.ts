import express from 'express';
import { rpcService } from '../services/rpc.service';
import { configLoader } from '../utils/config.loader';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const rpcs = configLoader.getRpcs();
        const tokens = configLoader.getTokens();
        
        res.json({
            success: true,
            data: {
                status: 'running',
                rpcs: rpcs.length,
                tokens: tokens.length,
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