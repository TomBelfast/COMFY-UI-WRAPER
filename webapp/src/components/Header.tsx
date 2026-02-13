"use client";

import { useState, useEffect } from "react";

interface ComfyStatus {
    status: "connected" | "disconnected" | "checking";
    comfyui_url?: string;
    devices?: { name: string; type: string; vram_total?: number }[];
}

import SettingsModal from "./SettingsModal";

export default function Header() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [comfyStatus, setComfyStatus] = useState<ComfyStatus>({
        status: "checking",
    });

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch("/api/comfy/health");
                if (response.ok) {
                    const data = await response.json();
                    setComfyStatus(data);
                } else {
                    setComfyStatus({ status: "disconnected" });
                }
            } catch {
                setComfyStatus({ status: "disconnected" });
            }
        };

        // Check immediately
        checkConnection();

        // Check every 10 seconds
        const interval = setInterval(checkConnection, 10000);

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
        checking: "Sprawdzam...",
    };

    return (
        <>
            <header className="glass-card m-4 p-4 flex items-center justify-between z-40 relative">
                <div className="flex items-center gap-4">
                    <h1 className="text-title text-2xl">ComfyUI Wrapper</h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Connection Status */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="relative">
                            <div
                                className={`w-3 h-3 rounded-full ${statusColors[comfyStatus.status]}`}
                            />
                            {comfyStatus.status === "connected" && (
                                <div
                                    className={`absolute inset-0 w-3 h-3 rounded-full ${statusColors[comfyStatus.status]} animate-ping opacity-75`}
                                />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white/90">
                                {statusLabels[comfyStatus.status]}
                            </span>
                            {comfyStatus.comfyui_url && (
                                <span className="text-xs text-white/40">
                                    {comfyStatus.comfyui_url}
                                </span>
                            )}
                        </div>
                        {comfyStatus.devices && comfyStatus.devices.length > 0 && (
                            <div className="ml-2 px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30">
                                <span className="text-xs text-emerald-400">
                                    {comfyStatus.devices[0].name?.split(" ")[0] || "GPU"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex gap-3">
                        <button className="btn-glass text-sm">Arena</button>
                        <button className="btn-glass text-sm">Models</button>
                        <button
                            className="btn-glass text-sm flex items-center gap-2"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <span>⚙️</span> Settings
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
