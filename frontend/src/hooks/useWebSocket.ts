import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useWebSocket<T>(event: string) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        const newSocket = io('https://amirez.info:3001', {
            transports: ['polling', 'websocket'],
            autoConnect: true,
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on(event, (newData: T) => {
            setData(newData);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [event]);

    return { socket, data };
}

export default useWebSocket;
