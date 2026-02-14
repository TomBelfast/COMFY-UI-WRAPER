import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModelDownloadModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const downloads = [
        {
            name: "Main Model (Z-Image Turbo AIO)",
            filename: "z-image-turbo-bf16-aio.safetensors",
            path: "ComfyUI/models/checkpoints/",
            url: "https://civitai.com/models/Z-Image-Turbo-AIO",
            direct: "https://huggingface.co/SeeSee21/Z-Image-Turbo-AIO/resolve/main/z-image-turbo-bf16-aio.safetensors?download=true"
        },
        {
            name: "Upscaler (SeedVR2)",
            filename: "seedvr2_ema_7b_sharp_fp16.safetensors",
            path: "ComfyUI/models/checkpoints/",
            url: "https://huggingface.co/numz/SeedVR2_comfyUI",
            direct: "https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/seedvr2_ema_7b_sharp_fp16.safetensors?download=true"
        },
        {
            name: "VAE (Upscaler)",
            filename: "ema_vae_fp16.safetensors",
            path: "ComfyUI/models/vae/",
            url: "https://huggingface.co/numz/SeedVR2_comfyUI",
            direct: "https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/ema_vae_fp16.safetensors?download=true"
        }
    ];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#121212] border border-white/10 shadow-2xl rounded-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                            Workflow Setup & Downloads
                        </h2>

                        <div className="space-y-6">
                            {/* Workflow Download */}
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                                    1. ComfyUI Workflow
                                </h3>
                                <p className="text-sm text-white/70 mb-4">
                                    Download this file and drag & drop it into your local ComfyUI window.
                                </p>
                                <div className="mt-4">
                                    <a
                                        href="/downloads/workflow_v1.json"
                                        download="workflow_setup.json"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors border border-emerald-400/20 shadow-lg shadow-emerald-900/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        Download .json
                                    </a>
                                </div>
                            </div>

                            {/* Models List */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">2. Required Models</h3>
                                <div className="space-y-3">
                                    {downloads.map((item, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10 group hover:border-emerald-500/30 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-emerald-300">{item.name}</h4>
                                                    <p className="text-xs text-white/40 mt-1 font-mono">{item.filename}</p>
                                                </div>
                                                <a
                                                    href={item.direct}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded bg-white/5 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-xs font-mono"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-white/50 mt-2 bg-black/20 p-2 rounded">
                                                <span className="text-white/30">Folder:</span>
                                                <code className="text-yellow-400/80">{item.path}</code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs text-white/30 pt-4 border-t border-white/10 text-center">
                                Note: If any nodes are missing (red), install them via ComfyUI Manager -&gt; "Install Missing Custom Nodes".
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                title="Download Workflow & Models"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>

            {mounted ? createPortal(modalContent, document.body) : null}
        </>
    );
}
