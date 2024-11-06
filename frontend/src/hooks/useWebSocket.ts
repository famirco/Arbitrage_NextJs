const newSocket = io('https://amirez.info', {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    secure: true,
    rejectUnauthorized: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 5000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    forceNew: true,
    autoConnect: true
});