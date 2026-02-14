
import { useState, useEffect, useCallback } from 'react';

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        // In local dev, we might need the direct backend URL if proxy isn't used
        // but relative path is best for production behind reverse proxy
        return '';
    }
    return process.env.BACKEND_URL || 'http://localhost:8000';
};

export const getBackendUrl = getBaseUrl;

const getApiBaseUrl = () => `${getBaseUrl()}/api/comfy`;
const getStoreUrl = () => `${getBaseUrl()}/api/store`;
const getWsUrl = () => {
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/api/comfy/ws`;
    }
    return 'ws://localhost:8000/api/comfy/ws';
};
const getGalleryUrl = () => `${getBaseUrl()}/api/gallery`;

export const getImageUrl = (filename: string, subfolder: string = "", type: string = "output") => {
    let url = `${getApiBaseUrl()}/image?filename=${filename}&type=${type}`;
    if (subfolder) url += `&subfolder=${subfolder}`;
    return url;
};

export interface ComfyStatus {
    status: string;
    comfyui_url: string;
    devices: any[];
}

export interface ModelList {
    models: string[];
}

export interface LoraList {
    loras: string[];
}

export interface GenerationRequest {
    positive_prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    sampler_name?: string;
    model?: string;
    lora_names?: string[];
    batch_size?: number;
    workflow_id?: string;
}

export const fetchHealth = async (): Promise<ComfyStatus> => {
    try {
        const res = await fetch(`${getApiBaseUrl()}/health`);
        return await res.json();
    } catch (e) {
        return { status: 'disconnected', comfyui_url: '', devices: [] };
    }
};

export const fetchModels = async (): Promise<string[]> => {
    const res = await fetch(`${getApiBaseUrl()}/models`);
    const data: ModelList = await res.json();
    return data.models || [];
};

export const fetchLoras = async (): Promise<string[]> => {
    const res = await fetch(`${getApiBaseUrl()}/loras`);
    const data: LoraList = await res.json();
    return data.loras || [];
};

export const generateImage = async (req: GenerationRequest) => {
    const res = await fetch(`${getApiBaseUrl()}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
    });
    return await res.json();
};

export interface GenerationPreset {
    id?: number;
    name: string;
    prompt_positive: string;
    prompt_negative: string;
    model: string;
    loras: string[];
    width: number;
    height: number;
    steps: number;
    cfg: number;
}

export const fetchConfig = async (key: string): Promise<string | null> => {
    try {
        const res = await fetch(`${getStoreUrl()}/config/${key}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.value;
    } catch (e) {
        return null;
    }
};

export const saveConfig = async (key: string, value: string) => {
    await fetch(`${getStoreUrl()}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
    });
};

export const fetchPresets = async (): Promise<GenerationPreset[]> => {
    try {
        const res = await fetch(`${getStoreUrl()}/presets`);
        return await res.json();
    } catch (e) {
        return [];
    }
};

export const savePreset = async (preset: GenerationPreset) => {
    const res = await fetch(`${getStoreUrl()}/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
    });
    if (!res.ok) throw new Error("Failed to save preset");
    return await res.json();
};

export const deletePreset = async (name: string) => {
    await fetch(`${getStoreUrl()}/presets/${name}`, {
        method: 'DELETE',
    });
};

export const useComfyWebSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(getWsUrl());

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (e) {
                console.error('Failed to parse WS message', e);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    return { socket, lastMessage, isConnected };
};

export interface GalleryItem {
    id: number;
    filename: string;
    subfolder: string;
    prompt_positive: string;
    prompt_negative: string;
    model: string;
    width: number;
    height: number;
    steps: number;
    cfg: number;
    created_at: string;
}

export interface GalleryItemCreate {
    filename: string;
    subfolder: string;
    prompt_positive: string;
    prompt_negative: string;
    model: string;
    width: number;
    height: number;
    steps: number;
    cfg: number;
    workflow_id?: string;
}

export const fetchGallery = async (workflowId?: string): Promise<GalleryItem[]> => {
    try {
        const url = workflowId
            ? `${getGalleryUrl()}?workflow_id=${workflowId}`
            : getGalleryUrl();
        const res = await fetch(url, { cache: 'no-store' });
        return await res.json();
    } catch (e) {
        return [];
    }
};

export const saveToGallery = async (item: GalleryItemCreate) => {
    await fetch(`${getGalleryUrl()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
};

export const deleteFromGallery = async (id: number) => {
    await fetch(`${getGalleryUrl()}/${id}`, {
        method: 'DELETE',
    });
};

export const clearGallery = async () => {
    await fetch(`${getGalleryUrl()}`, {
        method: 'DELETE',
    });
};

export const clearVram = async () => {
    const res = await fetch(`${getApiBaseUrl()}/clear-vram`, {
        method: 'POST',
    });
    return await res.json();
};

export const interrupt_generation = async () => {
    const res = await fetch(`${getApiBaseUrl()}/interrupt`, {
        method: 'POST',
    });
    return await res.json();
};
