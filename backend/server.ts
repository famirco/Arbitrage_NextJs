import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import cluster from 'cluster';

if (cluster.isPrimary) {
    // فقط یک نمونه اجرا می‌شود
    cluster.fork();

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // راه‌اندازی مجدد در صورت خطا
        cluster.fork();
    });
} else {
    const prisma = new PrismaClient();
    const app = express();
    const httpServer = createServer(app);

    app.use(cors());

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "https://amirez.info",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["*"]
        },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
        allowEIO3: true,
        cookie: false,
        perMessageDeflate: false,
        maxHttpBufferSize: 1e8
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        
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
        }, 10000);

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

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('SIGTERM signal received: closing HTTP server');
        await prisma.$disconnect();
        httpServer.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    });
}