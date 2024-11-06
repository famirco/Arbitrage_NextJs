import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useWebSocket<T>(event: string) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        const newSocket = io('wss://amirez.info', {
            path: '/socket.io/',
            transports: ['websocket'],
            secure: true,
            rejectUnauthorized: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        setSocket(newSocket);

        newSocket.on(event, (newData: T) => {
            setData(newData);
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [event]);

    return { socket, data };
}

export default useWebSocket;