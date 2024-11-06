import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useWebSocket<T>(event: string) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        // ایجاد اتصال Socket.IO
        const socket = io('https://amirez.info', {
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

        // تنظیم socket در state
        setSocket(socket);

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socket.on(event, (newData: T) => {
            setData(newData);
        });

        // Cleanup function
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [event]);

    return { socket, data };
}

export default useWebSocket;