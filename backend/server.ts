import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

// تنظیمات CORS
app.use(cors({
    origin: "https://amirez.info",
    credentials: true
}));

// یک interval مشترک برای همه کاربران
let cachedTrades = [];
let connectedClients = 0;
let globalMonitoringInterval: NodeJS.Timeout | null = null;

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "https://amirez.info",
        methods: ["GET", "POST"],
        credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// تابع به‌روزرسانی trades
async function updateTrades() {
    try {
        cachedTrades = await prisma.trade.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        // ارسال به همه کلاینت‌های متصل
        io.emit('monitoring-update', {
            trades: cachedTrades,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating trades:', error);
    }
}

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    connectedClients++;

    // ارسال داده‌های کش شده به کلاینت جدید
    socket.emit('monitoring-update', {
        trades: cachedTrades,
        timestamp: new Date().toISOString()
    });

    // شروع interval اگر اولین کلاینت است
    if (connectedClients === 1 && !globalMonitoringInterval) {
        globalMonitoringInterval = setInterval(updateTrades, 5000);
        updateTrades(); // اولین به‌روزرسانی
    }

    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    socket.on("disconnect", () => {
        connectedClients--;
        console.log("Client disconnected:", socket.id);

        // توقف interval اگر کلاینتی باقی نمانده
        if (connectedClients === 0 && globalMonitoringInterval) {
            clearInterval(globalMonitoringInterval);
            globalMonitoringInterval = null;
        }
    });
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
    if (globalMonitoringInterval) {
        clearInterval(globalMonitoringInterval);
    }
    await prisma.$disconnect();
    process.exit(0);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});