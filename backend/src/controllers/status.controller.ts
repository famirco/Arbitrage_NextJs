import express from 'express';
import { rpcService } from '../services/rpc.service';
import { priceService } from '../services/price.service';
import { PrismaClient } from '@prisma/client';
import { SystemStatus } from '../models/status.model';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const rpcStatus = rpcService.getRpcStatus();
        const activeRpcs = Array.from(rpcStatus.values()).filter(s => s.isActive).length;

        prisma.trade.aggregate({
            _count: {
                id: true
            },
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        })
        .then(trades => {
            return prisma.trade.count({
                where: {
                    status: 'SUCCESS',
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            })
            .then(successfulTrades => {
                const status: SystemStatus = {
                    activeRpcs,
                    totalRpcs: rpcStatus.size,
                    lastUpdate: new Date(),
                    activeTokens: Array.from(priceService.getAllPrices().keys()),
                    walletBalance: '0', // TODO: Implement wallet balance check
                    totalTrades: trades._count.id,
                    successfulTrades,
                    failedTrades: trades._count.id - successfulTrades
                };

                res.json({
                    success: true,
                    data: status
                });
            });
        })
        .catch(error => {
            throw error;
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