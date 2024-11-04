import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3001';


export function useWebSocket<T>(event: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(API_URL);

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on(event, (newData: T) => {
      setData(newData);
    });

    socketRef.current.on('error', (err: Error) => {
      setError(err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [event]);

  return { data, error };
}
