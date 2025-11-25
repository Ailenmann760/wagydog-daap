'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function useSocket() {
    return useContext(SocketContext);
}

export default function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
        const socketInstance = io(wsUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {
            console.log('✅ WebSocket connected');
            setConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            setConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
}
