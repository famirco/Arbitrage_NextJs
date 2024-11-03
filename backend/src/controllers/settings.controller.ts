import { Router } from 'express';

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
        console.error('Error getting settings:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error'
        });
    }
});

export default router;