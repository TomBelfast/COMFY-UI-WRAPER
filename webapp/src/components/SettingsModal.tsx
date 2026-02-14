import { useState, useEffect } from 'react';
import { updateProfile } from '@/lib/api';
import { useAuth } from './AuthProvider';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();
    // Use local state for the input, but initialize it only once
    const [comfyUrl, setComfyUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    // Only set initial value when modal opens for the first time
    useEffect(() => {
        if (isOpen && user) {
            setComfyUrl(user.comfyui_url || "http://192.168.0.14:8188");
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile({ comfyui_url: comfyUrl });
            onClose();
            // Full reload to ensure all components get the new URL
            window.location.reload();
        } catch (e) {
            console.error("Failed to save settings", e);
            alert("Failed to save setting. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const testConnection = async () => {
        setTestStatus('testing');
        try {
            const res = await fetch(`${comfyUrl}/system_stats`, { mode: 'cors' });
            if (res.ok) {
                setTestStatus('success');
            } else {
                setTestStatus('error');
            }
        } catch (e) {
            setTestStatus('error');
        }
        setTimeout(() => setTestStatus('idle'), 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-lg p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                >
                    ✕
                </button>

                <h2 className="text-title text-2xl mb-8">User Protocols</h2>

                <div className="space-y-8">
                    <div className="relative">
                        <div className="flex justify-between items-center mb-3">
                            <label htmlFor="comfyui-url-field" className="text-label block text-emerald-400">ComfyUI Endpoint</label>
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                                ID: {user?.username}
                            </span>
                        </div>

                        <div className="flex gap-3 h-12">
                            <input
                                id="comfyui-url-field"
                                type="text"
                                value={comfyUrl}
                                onChange={(e) => setComfyUrl(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                placeholder="http://100.x.y.z:8188"
                                autoComplete="off"
                            />
                            <button
                                onClick={testConnection}
                                disabled={testStatus === 'testing'}
                                className={`px-6 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${testStatus === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                                        testStatus === 'error' ? 'bg-red-500/20 border-red-500 text-red-400' :
                                            'bg-white/5 border-white/10 hover:border-emerald-500/50'
                                    }`}
                            >
                                {testStatus === 'testing' ? '...' : 'Test'}
                            </button>
                        </div>
                        <p className="text-[10px] text-white/30 mt-3 italic">
                            Enter your Tailscale Node IP (e.g. 100.x.y.z:8188)
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex gap-3">
                            <div className="w-1 h-12 bg-emerald-500/30 rounded-full" />
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-1">Grid Isolation Active</h4>
                                <p className="text-[11px] text-white/50 leading-relaxed">
                                    Your generation requests will be routed through this specific node.
                                    Ensure Tailscale is connected.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-glass px-8">Discard</button>
                    <button
                        onClick={handleSave}
                        className="btn-primary min-w-[160px]"
                        disabled={isLoading}
                    >
                        {isLoading ? "Synchronizing..." : "Link Node"}
                    </button>
                </div>
            </div>
        </div>
    );
}
