import { AppContext } from '@/providers';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket;

export default function MeetMain() {
  const { meetId } = useRouter().query;

  useEffect(() => {
    socket = io('http://localhost:5001');
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.on('disconnect', () => {
      console.log('disconnected');
    });
  }, []);

  useEffect(() => {
    if (meetId) {
      // emit join event to server
      socket.emit('join-room', meetId);
    }
  }, [meetId]);

  return <div>MeetMain</div>;
}
