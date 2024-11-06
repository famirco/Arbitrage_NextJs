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

// کاهش فرکانس ارسال داده‌ها
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
    }, 10000); // افزایش به 10 ثانیه

    socket.on("disconnect", () => {
        clearInterval(monitoringInterval);
        console.log("Client disconnected:", socket.id);
    });
});