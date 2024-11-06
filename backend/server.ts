import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';  // تغییر نام import
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);  // تعریف httpServer
const io = new SocketIOServer(httpServer, {  // استفاده از نام جدید
    cors: {
        origin: "https://amirez.info",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Access-Control-Allow-Origin"]
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
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