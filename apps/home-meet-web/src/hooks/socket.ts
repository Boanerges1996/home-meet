import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

type UseSocketReturnType = [Socket | null, boolean];

export const useSocket = (): UseSocketReturnType => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5001');

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('connected');
    });
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.disconnect();
    };
  }, []);

  return [socket, isConnected];
};
