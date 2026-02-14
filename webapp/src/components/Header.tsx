
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearVram, interrupt_generation, fetchHealth } from '@/lib/api';
import SettingsModal from "./SettingsModal";
import { useAuth } from "./AuthProvider";

interface ComfyStatus {
    status: "connected" | "disconnected" | "checking";
    comfyui_url?: string;
    devices?: { name: string; type: string; vram_total?: number; vram_free?: number }[];
}

export default function Header() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isInterrupting, setIsInterrupting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [comfyStatus, setComfyStatus] = useState<ComfyStatus>({
        status: "checking",
    });

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const data = await fetchHealth();
                setComfyStatus(data);
            } catch {
                setComfyStatus({ status: "disconnected" });
            }
        };
        checkConnection();
        const interval = setInterval(checkConnection, 2000);
        return () => clearInterval(interval);
    }, []);

    const statusColors = {
        connected: "bg-emerald-500",
        disconnected: "bg-red-500",
        checking: "bg-yellow-500",
    };

    const statusLabels = {
        connected: "ComfyUI Online",
        disconnected: "ComfyUI Offline",
        checking: "Checking...",
    };

    const handleClearVram = async () => {
        setIsClearing(true);
        setStatusMessage("Clearing VRAM...");
        try {
            await clearVram();
            setStatusMessage("VRAM Cleared");
        } catch (e) {
            setStatusMessage("Error clearing VRAM");
        } finally {
            setIsClearing(false);
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleInterrupt = async () => {
        setIsInterrupting(true);
        setStatusMessage("Interrupting...");
        try {
            await interrupt_generation();
            setStatusMessage("Stopped");
            // Global event to reset UI in all labs
            window.dispatchEvent(new CustomEvent('comfy-stop'));
        } catch (e) {
            setStatusMessage("Error stopping");
        } finally {
            setIsInterrupting(false);
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const formatVram = (total: number, free: number) => {
        const used = total - free;
        const toGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1);
        return `${toGB(used)} / ${toGB(total)} GB`;
    };

    return (
        <>
            <header className="glass-card m-4 p-4 flex items-center justify-between z-40 relative">
                <div className="flex items-center gap-6">
                    <Link href="/" className="group">
                        <h1 className="text-title text-2xl group-hover:text-emerald-400 transition-colors">ComfyUI Wrapper</h1>
                    </Link>

                    {/* Status Display Area (Moved to left) */}
                    <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all cursor-help group/status">
                        <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusColors[comfyStatus.status]}`} />
                            {comfyStatus.status === "connected" && (
                                <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${statusColors[comfyStatus.status]} animate-ping opacity-50`} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-label !tracking-widest !text-[9px] mb-0.5">Grid Status</span>
                            <span className="text-xs font-bold text-white/95 leading-none">{statusLabels[comfyStatus.status]}</span>
                        </div>
                        {comfyStatus.devices && comfyStatus.devices.length > 0 && comfyStatus.devices[0].vram_total && (
                            <div className="ml-4 border-l border-white/10 pl-4 flex flex-col items-end">
                                <span className="text-label !tracking-widest !text-[9px] !text-emerald-500/70 mb-0.5">VRAM Reserve</span>
                                <span className="text-sm font-mono font-bold text-emerald-400 leading-none">
                                    {formatVram(comfyStatus.devices[0].vram_total, comfyStatus.devices[0].vram_free || 0)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* STOP Button */}
                    <button
                        onClick={handleInterrupt}
                        disabled={isInterrupting}
                        className={`flex items-center gap-2 px-3 h-10 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/60 transition-all group ${isInterrupting ? 'opacity-50' : ''} shadow-[0_0_15px_rgba(239,68,68,0.1)]`}
                        title="INTERRUPT GENERATION"
                    >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400 group-hover:text-white">Stop</span>
                    </button>

                    {/* PURGE Button */}
                    <button
                        onClick={handleClearVram}
                        disabled={isClearing}
                        className={`flex items-center gap-2 px-3 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/30 hover:border-orange-500/60 transition-all group ${isClearing ? 'opacity-50' : ''} shadow-[0_0_15px_rgba(249,115,22,0.1)]`}
                        title="CLEAR VRAM"
                    >
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 group-hover:text-white">Purge</span>
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    {/* Status Message (Animated Overlay) */}
                    {statusMessage && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 px-4 py-1 bg-white/5 border border-white/10 rounded-full animate-fade-in backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">{statusMessage}</span>
                        </div>
                    )}



                    {/* User Info + Logout */}
                    {user && (
                        <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-white/5 border border-white/10">
                            {user.profile_pic ? (
                                <img src={user.profile_pic} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-emerald-400">
                                        {(user.display_name || user.username || "?")[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <span className="text-xs text-white/70 font-medium">{user.display_name || user.username}</span>
                            <button
                                onClick={logout}
                                className="ml-1 p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Navigation Protocols (Labs) */}
                    <nav className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5 h-10">
                        <Link
                            href="/"
                            className={`px-4 h-full flex items-center text-label !tracking-widest rounded-lg transition-all ${pathname === "/" ? "!text-emerald-400 bg-white/5 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            Z-Turbo
                        </Link>
                        <Link
                            href="/upscale"
                            className={`px-4 h-full flex items-center text-label !tracking-widest rounded-lg transition-all ${pathname === "/upscale" ? "!text-emerald-400 bg-white/5 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            Z-Turbo Up
                        </Link>
                        <Link
                            href="/character"
                            className={`px-4 h-full flex items-center text-label !tracking-widest rounded-lg transition-all ${pathname === "/character" ? "!text-emerald-400 bg-white/5 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            Character
                        </Link>

                        <div className="w-px h-4 bg-white/10 mx-2" />
                        <button
                            className="p-2 h-full rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all flex items-center justify-center"
                            onClick={() => setIsSettingsOpen(true)}
                            title="Protocol Settings"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </nav>
                </div>
            </header>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}
