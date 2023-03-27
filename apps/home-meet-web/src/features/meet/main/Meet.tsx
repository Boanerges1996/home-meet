import React, { useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket;

export default function MeetMain() {
  useEffect(() => {
    socket = io('http://localhost:5001');
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.on('disconnect', () => {
      console.log('disconnected');
    });
  }, []);
  return <div>MeetMain</div>;
}
