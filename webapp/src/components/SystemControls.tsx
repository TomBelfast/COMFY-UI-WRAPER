
"use client";

import { useState } from 'react';
import { interrupt_generation, clearVram } from '@/lib/api';

export default function SystemControls() {
    const [status, setStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleInterrupt = async () => {
        setIsLoading(true);
        setStatus("Interrupting...");
        try {
            await interrupt_generation();
            setStatus("STOPPED");
        } catch (e) {
            setStatus("Error stopping");
        }
        setIsLoading(false);
        setTimeout(() => setStatus(null), 3000);
    };

    const handleClearVram = async () => {
        setIsLoading(true);
        setStatus("Clearing VRAM...");
        try {
            await clearVram();
            setStatus("VRAM CLEARED");
        } catch (e) {
            setStatus("Error clearing");
        }
        setIsLoading(false);
        setTimeout(() => setStatus(null), 3000);
    };

    return (
        <div className="glass-card p-6 animate-fade-in-up stagger-5 border-red-500/10">
            <span className="text-[10px] text-red-500/60 uppercase tracking-widest font-bold block mb-2">Emergency Recovery</span>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleInterrupt}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 transition-all group"
                >
                    <svg className="w-6 h-6 text-red-500 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" />
                    </svg>
                    <span className="text-[10px] uppercase font-bold text-red-400">Interrupt</span>
                </button>

                <button
                    onClick={handleClearVram}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all group"
                >
                    <svg className="w-6 h-6 text-orange-500 mb-1 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-[10px] uppercase font-bold text-orange-400">Clear VRAM</span>
                </button>
            </div>
            {status && (
                <div className="mt-3 text-[10px] text-center font-mono text-white/50 animate-pulse uppercase tracking-[0.2em]">
                    {status}
                </div>
            )}
        </div>
    );
}
