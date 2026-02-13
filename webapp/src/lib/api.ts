
import { useState, useEffect, useCallback } from 'react';

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return ''; // Use relative path, Next.js proxy handles it
    }
    return 'http://localhost:8000'; // Server side
};

export const getBackendUrl = getBaseUrl;

const getWsUrl = () => {
    if (typeof window !== 'undefined') {
        return `ws://${window.location.hostname}:8000`;
    }
    return 'ws://localhost:8000';
};

const API_BASE_URL = `${getBaseUrl()}/api/comfy`;
const STORE_URL = `${getBaseUrl()}/api/store`;
const WS_BASE_URL = `${getWsUrl()}/api/comfy/ws`;

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
    model?: string;
    lora_names?: string[];
}

export const fetchHealth = async (): Promise<ComfyStatus> => {
    try {
        const res = await fetch(`${API_BASE_URL}/health`);
        return await res.json();
    } catch (e) {
        return { status: 'disconnected', comfyui_url: '', devices: [] };
    }
};

export const fetchModels = async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE_URL}/models`);
    const data: ModelList = await res.json();
    return data.models || [];
};

export const fetchLoras = async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE_URL}/loras`);
    const data: LoraList = await res.json();
    return data.loras || [];
};

export const generateImage = async (req: GenerationRequest) => {
    const res = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
    });
    return await res.json();
};

// Persistence API
// const STORE_URL defined at top

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
        const res = await fetch(`${STORE_URL}/config/${key}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.value;
    } catch (e) {
        return null;
    }
};

export const saveConfig = async (key: string, value: string) => {
    await fetch(`${STORE_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
    });
};

export const fetchPresets = async (): Promise<GenerationPreset[]> => {
    try {
        const res = await fetch(`${STORE_URL}/presets`);
        return await res.json();
    } catch (e) {
        return [];
    }
};

export const savePreset = async (preset: GenerationPreset) => {
    const res = await fetch(`${STORE_URL}/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
    });
    if (!res.ok) throw new Error("Failed to save preset");
    return await res.json();
};

export const deletePreset = async (name: string) => {
    await fetch(`${STORE_URL}/presets/${name}`, {
        method: 'DELETE',
    });
};

export const useComfyWebSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(WS_BASE_URL);

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

// Gallery API
const GALLERY_URL = `${getBaseUrl()}/api/gallery`;

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
}

export const fetchGallery = async (): Promise<GalleryItem[]> => {
    try {
        const res = await fetch(`${GALLERY_URL}/`);
        return await res.json();
    } catch (e) {
        return [];
    }
};

export const saveToGallery = async (item: GalleryItemCreate) => {
    await fetch(`${GALLERY_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
};

export const deleteFromGallery = async (id: number) => {
    await fetch(`${GALLERY_URL}/${id}`, {
        method: 'DELETE',
    });
};
