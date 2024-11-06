import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Monitoring endpoint
app.get('/monitoring', async (req, res) => {
    try {
        // اطلاعات مانیتورینگ را از دیتابیس دریافت می‌کنیم
        const latestTrades = await prisma.trade.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });

        // وضعیت اتصال به RPC ها را بررسی می‌کنیم
        const alchemyStatus = "connected"; // این را باید با وضعیت واقعی جایگزین کنید
        const infuraStatus = "connected";  // این را باید با وضعیت واقعی جایگزین کنید

        res.json({
            status: 'success',
            data: {
                trades: latestTrades,
                connections: {
                    alchemy: alchemyStatus,
                    infura: infuraStatus
                },
                serverTime: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Monitoring error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Socket.IO برای آپدیت‌های realtime
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // ارسال آپدیت‌های مانیتورینگ
    const monitoringInterval = setInterval(async () => {
        try {
            const latestTrades = await prisma.trade.findMany({
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                }
            });
            
            socket.emit('monitoring-update', {
                trades: latestTrades,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Socket monitoring error:', error);
        }
    }, 5000); // هر 5 ثانیه

    socket.on("disconnect", () => {
        clearInterval(monitoringInterval);
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});