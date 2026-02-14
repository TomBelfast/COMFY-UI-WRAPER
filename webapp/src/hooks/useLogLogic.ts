
"use client";

import { useState, useEffect, useRef } from 'react';

export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    module: string;
    function: string;
    line: number;
}

export function useLogLogic() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/comfy/ws`;

        let socket: WebSocket;
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                setIsConnected(true);
                console.log("Log Socket Connected");
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'log') {
                        setLogs(prev => [...prev.slice(-199), data.data]);
                    }
                } catch (e) {
                    console.error("Log error", e);
                }
            };

            socket.onclose = () => {
                setIsConnected(false);
                reconnectTimer = setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            if (socket) socket.close();
            clearTimeout(reconnectTimer);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return {
        logs,
        setLogs,
        isConnected,
        isVisible,
        setIsVisible,
        isMounted,
        scrollRef
    };
}
