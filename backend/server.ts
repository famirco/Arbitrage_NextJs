import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

app.use(cors());

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "https://amirez.info",
        methods: ["GET", "POST"],
        credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true
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
    }, 5000);

    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    socket.on("disconnect", () => {
        clearInterval(monitoringInterval);
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});