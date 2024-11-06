const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "https://amirez.info",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["*"]
    },
    path: '/socket.io/',
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true,
    cookie: false
});