
"use client";

import { useState, useEffect } from 'react';
import { clearVram, fetchHealth } from '@/lib/api';

interface ComfyStatus {
    status: "connected" | "disconnected" | "checking";
    comfyui_url?: string;
    devices?: { name: string; type: string; vram_total?: number; vram_free?: number }[];
}

export function useHeaderLogic() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [comfyStatus, setComfyStatus] = useState<ComfyStatus>({ status: "checking" });

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const data = await fetchHealth();
                setComfyStatus(data as any);
            } catch {
                setComfyStatus({ status: "disconnected" });
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleClearVram = async () => {
        if (!confirm("Are you sure you want to clear ComfyUI VRAM?")) return;
        setIsClearing(true);
        try {
            await clearVram();
        } catch (e) {
            console.error("VRAM Clear failed", e);
        } finally {
            setIsClearing(false);
        }
    };

    const formatVram = (total: number, free: number) => {
        const used = total - free;
        const toGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1);
        return `${toGB(used)} / ${toGB(total)} GB`;
    };

    return {
        isSettingsOpen,
        setIsSettingsOpen,
        isClearing,
        comfyStatus,
        handleClearVram,
        formatVram
    };
}
