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
        // Use the API URL and let socket.io handle the protocol
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        const socketInstance = io(apiUrl, {
            transports: ['websocket', 'polling'], // Allow fallback to polling
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            timeout: 20000,
        });

        socketInstance.on('connect', () => {
            console.log('✅ WebSocket connected');
            setConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.log('⚠️ WebSocket connection error:', error.message);
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
