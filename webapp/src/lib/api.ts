
import { useState, useEffect, useCallback } from 'react';

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        return '';
    }
    return process.env.BACKEND_URL || 'http://localhost:8000';
};

export const getBackendUrl = getBaseUrl;

const getApiBaseUrl = () => `${getBaseUrl()}/api/comfy`;
const getStoreUrl = () => `${getBaseUrl()}/api/store`;
const getAuthUrl = () => `${getBaseUrl()}/api/auth`;
const getWsUrl = () => {
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const token = getToken();
        const url = `${protocol}//${host}/api/comfy/ws`;
        return token ? `${url}?token=${token}` : url;
    }
    return 'ws://localhost:8000/api/comfy/ws';
};
const getGalleryUrl = () => `${getBaseUrl()}/api/gallery`;

// --- Auth Token Management ---

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

export const setToken = (token: string) => {
    localStorage.setItem('auth_token', token);
};

export const clearToken = () => {
    localStorage.removeItem('auth_token');
};

const authHeaders = (): Record<string, string> => {
    const token = getToken();
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
};

const authFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = {
        ...authHeaders(),
        ...(options.headers || {}),
    };
    return fetch(url, { ...options, headers });
};

// --- Auth API ---

export interface AuthUser {
    id: number;
    username: string;
    display_name: string | null;
    profile_pic: string | null;
    tailscale_login: string | null;
    comfyui_url: string | null;
    is_admin: boolean;
}

export const login = async (username: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const res = await fetch(`${getAuthUrl()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(err.detail || 'Login failed');
    }
    return res.json();
};

export const register = async (username: string, password: string, display_name?: string): Promise<{ token: string; user: AuthUser }> => {
    const res = await fetch(`${getAuthUrl()}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, display_name }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
};

export const fetchMe = async (): Promise<AuthUser | null> => {
    try {
        const res = await authFetch(`${getAuthUrl()}/me`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
};

export const updateProfile = async (data: { display_name?: string; comfyui_url?: string }): Promise<AuthUser> => {
    const res = await authFetch(`${getAuthUrl()}/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
};

// --- Existing API (now with auth) ---

export const getImageUrl = (filename: string, subfolder: string = "", type: string = "output") => {
    let url = `${getApiBaseUrl()}/image?filename=${filename}&type=${type}`;
    if (subfolder) url += `&subfolder=${subfolder}`;
    return url;
};

export const getThumbnailUrl = (filename: string, subfolder: string = "", maxSize: number = 300) => {
    let url = `${getApiBaseUrl()}/thumbnail?filename=${filename}&max_size=${maxSize}`;
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
        const res = await authFetch(`${getApiBaseUrl()}/health`);
        return await res.json();
    } catch (e) {
        return { status: 'disconnected', comfyui_url: '', devices: [] };
    }
};

export const fetchModels = async (): Promise<string[]> => {
    const res = await authFetch(`${getApiBaseUrl()}/models`);
    const data: ModelList = await res.json();
    return data.models || [];
};

export const fetchLoras = async (): Promise<string[]> => {
    const res = await authFetch(`${getApiBaseUrl()}/loras`);
    const data: LoraList = await res.json();
    return data.loras || [];
};

export const generateImage = async (req: GenerationRequest) => {
    const res = await authFetch(`${getApiBaseUrl()}/generate`, {
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
        const res = await authFetch(`${getStoreUrl()}/config/${key}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.value;
    } catch (e) {
        return null;
    }
};

export const saveConfig = async (key: string, value: string) => {
    await authFetch(`${getStoreUrl()}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
    });
};

export const fetchPresets = async (): Promise<GenerationPreset[]> => {
    try {
        const res = await authFetch(`${getStoreUrl()}/presets`);
        return await res.json();
    } catch (e) {
        return [];
    }
};

export const savePreset = async (preset: GenerationPreset) => {
    const res = await authFetch(`${getStoreUrl()}/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
    });
    if (!res.ok) throw new Error("Failed to save preset");
    return await res.json();
};

export const deletePreset = async (name: string) => {
    await authFetch(`${getStoreUrl()}/presets/${name}`, {
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
    prompt_id?: string;
    workflow_id: string;
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
        const res = await authFetch(url);
        return await res.json();
    } catch (e) {
        return [];
    }
};

export const saveToGallery = async (item: GalleryItemCreate) => {
    await authFetch(`${getGalleryUrl()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
};

export const deleteFromGallery = async (id: number) => {
    await authFetch(`${getGalleryUrl()}/${id}`, {
        method: 'DELETE',
    });
};

export const clearGallery = async () => {
    await authFetch(`${getGalleryUrl()}`, {
        method: 'DELETE',
    });
};

export const clearVram = async () => {
    const res = await authFetch(`${getApiBaseUrl()}/clear-vram`, {
        method: 'POST',
    });
    return await res.json();
};

export const interrupt_generation = async () => {
    const res = await authFetch(`${getApiBaseUrl()}/interrupt`, {
        method: 'POST',
    });
    return await res.json();
};
