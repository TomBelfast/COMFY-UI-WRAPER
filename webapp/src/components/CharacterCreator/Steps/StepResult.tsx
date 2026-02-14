"use client";

import { useEffect, useState } from "react";
import { useGenerationLogic } from "@/hooks/useGenerationLogic";
import { fetchGallery, getImageUrl, GalleryItem } from "@/lib/api";
import { downloadImage } from "@/lib/utils";
import { Download, Maximize2 } from "lucide-react";

interface StepResultProps {
    prompt: string;
    onBack: () => void;
    onGeneratingChange?: (isGenerating: boolean) => void;
}

export default function StepResult({ prompt, onBack, onGeneratingChange }: StepResultProps) {
    const logic = useGenerationLogic("turbo-gen");

    // Pass generation state to parent
    useEffect(() => {
        onGeneratingChange?.(logic.isGenerating);
    }, [logic.isGenerating, onGeneratingChange]);
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [hasAutoStarted, setHasAutoStarted] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

    // Initialize state from localStorage after mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('wizard_last_generated_prompt');
                if (saved === prompt) {
                    setHasAutoStarted(true);
                }
            } catch (e) {
                console.warn("Storage access error:", e);
            }
        }
    }, [prompt]);

    // 1. Initialize stable parameters
    useEffect(() => {
        logic.setSelectedModel("z-image-turbo-bf16-aio.safetensors");
        logic.setSteps(8);
        logic.setCfg(1.0);
        logic.setSampler("res_multistep");

        // Clear previous selection on entry
        try {
            localStorage.removeItem("wizard_selected_image");
        } catch (e) { }
    }, []);

    // 2. Sync prompt to logic state
    useEffect(() => {
        if (prompt && logic.positivePrompt !== prompt) {
            logic.setPositivePrompt(prompt);
            // If the prompt changes externally, reset the auto-start guard
            try {
                setHasAutoStarted(localStorage.getItem('wizard_last_generated_prompt') === prompt);
            } catch (e) {
                setHasAutoStarted(false);
            }
        }
    }, [prompt, logic.positivePrompt]);

    // 3. Auto-generate when ready
    useEffect(() => {
        const isReady = prompt &&
            logic.positivePrompt === prompt &&
            logic.selectedModel !== "Loading..." &&
            !logic.isGenerating &&
            !hasAutoStarted &&
            !selectedImage;

        if (isReady) {
            setHasAutoStarted(true);
            try {
                localStorage.setItem('wizard_last_generated_prompt', prompt);
            } catch (e) { }
            const startBatch = async () => {
                await logic.handleGenerate();
                await new Promise(r => setTimeout(r, 1000));
                await logic.handleGenerate();
                await new Promise(r => setTimeout(r, 1000));
                await logic.handleGenerate();
            };
            startBatch();
        }
    }, [prompt, logic.positivePrompt, logic.selectedModel, logic.isGenerating, hasAutoStarted, selectedImage]);

    // 4. Load images and listen for external selection
    useEffect(() => {
        const refresh = async () => {
            const gallery = await fetchGallery("turbo-gen");
            if (gallery && gallery.length > 0) {
                const sorted = gallery.sort((a: any, b: any) => b.id - a.id);
                const latest = sorted.slice(0, 3);
                setImages(latest);

                // CRITICAL: Strip image_data before saving to localStorage to avoid QuotaExceededError (5MB limit)
                // image_data is bulky base64. getImageUrl will fallback to server URL if missing.
                const storageItems = latest.map(({ image_data, ...rest }) => rest);
                try {
                    localStorage.setItem("wizard_session_images", JSON.stringify(storageItems));
                } catch (e) {
                    console.warn("Could not save to localStorage:", e);
                }
            }
        };

        if (logic.galleryRefresh > 0) {
            refresh();
        } else {
            try {
                const saved = localStorage.getItem("wizard_session_images");
                if (saved) setImages(JSON.parse(saved));
                else refresh();
            } catch (e) {
                console.warn("Storage access blocked or error:", e);
                refresh();
            }
        }

        // Listen for selection from separate window
        const checkSelection = () => {
            try {
                const selection = localStorage.getItem("wizard_selected_image");
                if (selection) {
                    setSelectedImage(JSON.parse(selection));
                }
            } catch (e) {
                // Ignore storage errors in polling
            }
        };

        const interval = setInterval(checkSelection, 500);
        return () => clearInterval(interval);
    }, [logic.galleryRefresh]);

    const progressValue = logic.progress.max > 0
        ? (logic.progress.value / logic.progress.max) * 100
        : 0;

    const openPreview = (idx: number) => {
        window.open(`/view?idx=${idx}`, '_blank');
    };

    const handleSelect = (img: GalleryItem) => {
        setSelectedImage(img);
        try {
            // Strip bulky image_data before saving
            const { image_data, ...rest } = img;
            localStorage.setItem("wizard_selected_image", JSON.stringify(rest));
        } catch (e) {
            console.warn("Could not save selection:", e);
        }
    };

    if (selectedImage) {
        return (
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-700">
                <div className="relative mb-12 group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
                    <img
                        src={getImageUrl(selectedImage.filename, selectedImage.subfolder, "output", selectedImage.image_data)}
                        className="w-[400px] aspect-[9/16] object-cover rounded-[32px] border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] relative z-10"
                        alt="Selected"
                    />
                    <div className="absolute -top-6 -right-6 z-20 bg-emerald-500 text-black px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-xl animate-bounce">
                        Selected
                    </div>
                </div>

                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 text-center">
                    Neural Identity <span className="text-emerald-500">Confirmed</span>
                </h2>
                <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em] mb-12">
                    Character record saved successfully // ID #{selectedImage.id}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setSelectedImage(null);
                            try {
                                localStorage.removeItem("wizard_selected_image");
                            } catch (e) { }
                        }}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all"
                    >
                        Change Variant
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-12 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-emerald-400 transition-all font-black"
                    >
                        New Generation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-full mx-auto pb-20 animate-fade-in relative h-full justify-center">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-8 text-center shrink-0">
                Review Your <span className="text-emerald-500">Neural Decodings</span>
            </h2>

            {/* Main View - Side by Side Results */}
            <div className="flex-1 w-full flex justify-center items-start mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 md:px-0">
                    {images.length > 0 ? (
                        images.map((img, idx) => (
                            <div
                                key={img.id}
                                className="relative w-full aspect-[9/16] bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group transition-all hover:scale-[1.02] hover:border-emerald-500/30"
                            >
                                <img
                                    src={getImageUrl(img.filename, img.subfolder, "output", img.image_data)}
                                    alt={`Result ${idx + 1}`}
                                    className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-transform duration-700"
                                    onClick={() => openPreview(idx)}
                                />

                                {/* Actions Overlay */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        id={`download-${img.id}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadImage(getImageUrl(img.filename, img.subfolder, "output", img.image_data), `character-${img.id}.png`);
                                        }}
                                        className="p-3 bg-black/60 hover:bg-emerald-500 rounded-xl text-white hover:text-black transition-all border border-white/10"
                                        title="Download Image"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        id={`fullscreen-${img.id}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openPreview(idx);
                                        }}
                                        className="p-3 bg-black/60 hover:bg-emerald-500 rounded-xl text-white hover:text-black transition-all border border-white/10"
                                        title="Full Screen"
                                    >
                                        <Maximize2 size={18} />
                                    </button>
                                </div>

                                {/* Overlay Info */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 translate-y-4 group-hover:translate-y-0 transition-transform z-10">
                                    <div className="text-[10px] font-mono text-emerald-400 mb-2 opacity-50 uppercase">STREAM_BUFFER #{img.id}</div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            id={`select-variant-${img.id}`}
                                            onClick={() => handleSelect(img)}
                                            className="w-full py-4 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                                        >
                                            Choose Variant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Loading State / Empty State - Centered in Grid
                        <div className="col-span-1 md:col-start-2 relative w-full aspect-[9/16] bg-black/40 rounded-3xl overflow-hidden border border-white/10 flex flex-col items-center justify-center">
                            {logic.isGenerating ? (
                                <div className="flex flex-col items-center text-center space-y-4 z-10 p-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full animate-pulse" />
                                        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-emerald-400 font-mono text-lg font-bold tracking-[0.2em] uppercase">
                                            {progressValue.toFixed(0)}%
                                        </div>
                                        <div className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] animate-pulse">
                                            Processing Batch
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-6 space-y-3">
                                    <div className="text-white/20 text-[10px] font-mono uppercase">waiting_for_input_stream</div>
                                    <button
                                        onClick={() => logic.handleGenerate()}
                                        className="px-4 py-1.5 bg-emerald-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl snake-active"
                                    >
                                        Force Generation
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="shrink-0 z-20">
                <button
                    onClick={() => logic.handleGenerate()}
                    className={`px-12 py-4 rounded-xl font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 text-sm shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] ${logic.isGenerating ? 'snake-active' : ''}`}
                >
                    {logic.isGenerating ? 'Decoding...' : 'Generate More Variants'}
                </button>
            </div>
        </div>
    );
}




