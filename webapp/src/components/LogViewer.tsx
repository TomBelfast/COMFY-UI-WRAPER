'use client';

import React, { useEffect, useState, useRef } from 'react';

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    module: string;
    function: string;
    line: number;
}

const LogViewer: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let wsUrl = '';

        // If running on standard ports (likely production/proxy)
        if (window.location.port === '' || window.location.port === '80' || window.location.port === '443') {
            wsUrl = `${protocol}//${window.location.host}/api/logs/ws`;
        } else {
            // Development with specific ports
            const host = window.location.hostname;
            const port = '8000';
            wsUrl = `${protocol}//${host}:${port}/api/logs/ws`;
        }

        console.log(`Connecting to logs at: ${wsUrl}`);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setIsConnected(true);
            console.log('Logs WebSocket connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLogs((prev) => [...prev, data].slice(-100)); // Keep last 100 logs
            } catch (err) {
                console.error('Error parsing log entry:', err);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('Logs WebSocket disconnected');
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 btn-glass py-2 px-4 text-xs z-50"
            >
                SHOW SYSTEM LOGS
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-64 glass-card border-t border-emerald-mid/30 z-50 flex flex-col overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-2 border-b border-glass-border bg-black/40">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                    <span className="text-label text-[10px]">SYSTEM LOGS ENGINE</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setLogs([])}
                        className="text-[10px] text-muted hover:text-emerald-light transition-colors uppercase font-bold"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-[10px] text-muted hover:text-white transition-colors uppercase font-bold"
                    >
                        Hide
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 bg-black/20"
            >
                {logs.length === 0 && (
                    <div className="text-muted italic">Waiting for logs...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex space-x-3 border-l border-emerald-mid/10 pl-2">
                        <span className="text-muted whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`font-bold whitespace-nowrap transition-colors duration-500 ${log.level === 'ERROR' ? 'text-red-400' :
                            log.level === 'WARNING' ? 'text-yellow-400' :
                                log.level === 'SUCCESS' ? 'text-emerald-400' :
                                    'text-emerald-500/70'
                            }`}>
                            {log.level}
                        </span>
                        <span className="text-emerald-100/40 whitespace-nowrap">[{log.module}:{log.line}]</span>
                        <span className="text-text-secondary break-all">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogViewer;
