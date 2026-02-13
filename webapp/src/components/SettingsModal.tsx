import { useState, useEffect } from 'react';
import { fetchConfig, saveConfig } from '@/lib/api';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [comfyUrl, setComfyUrl] = useState("http://192.168.0.14:8188"); // Default fallback
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load settings when modal opens
            const loadSettings = async () => {
                setIsLoading(true);
                const url = await fetchConfig("comfyui_url");
                if (url) setComfyUrl(url);
                setIsLoading(false);
            };
            loadSettings();
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await saveConfig("comfyui_url", comfyUrl);
            onClose();
        } catch (e) {
            console.error("Failed to save settings", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card card-3d-cinematic w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-title text-2xl mb-6">Settings</h2>

                <div className="space-y-6">
                    <div>
                        <label className="text-label block mb-2">ComfyUI URL</label>
                        <input
                            type="text"
                            className="input-glass w-full"
                            value={comfyUrl}
                            onChange={(e) => setComfyUrl(e.target.value)}
                            placeholder="http://192.168.0.14:8188"
                        />
                        <p className="text-xs text-white/40 mt-1">Address of your ComfyUI instance</p>
                    </div>

                    <div>
                        <label className="text-label block mb-2">Theme</label>
                        <select className="input-glass w-full">
                            <option>Matrix (Default)</option>
                            <option>Cyberpunk</option>
                            <option>Minimal</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-glass">Cancel</button>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
