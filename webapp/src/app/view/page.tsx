"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getImageUrl, GalleryItem } from "@/lib/api";
import { downloadImage } from "@/lib/utils";
import { Download, Maximize, ChevronLeft, ChevronRight, X } from "lucide-react";

function ViewContent() {
    const searchParams = useSearchParams();
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [index, setIndex] = useState<number>(0);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("wizard_session_images");
        if (saved) {
            const parsed = JSON.parse(saved);
            setImages(parsed);

            const startIdx = parseInt(searchParams.get("idx") || "0");
            if (startIdx >= 0 && startIdx < parsed.length) {
                setIndex(startIdx);
            }
        }
    }, [searchParams]);

    // Reset zoom when switching images
    useEffect(() => {
        setIsZoomed(false);
    }, [index]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (images.length === 0) return;
            if (e.key === "ArrowLeft") setIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
            if (e.key === "ArrowRight") setIndex(prev => (prev + 1) % images.length);
            if (e.key === "Escape") window.close();
            if (e.key === "f" || e.key === "F") toggleFullscreen();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [images.length]);

    if (images.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center font-mono text-emerald-500/50 uppercase tracking-[0.5em]">
                Initializing_Stream...
            </div>
        );
    }

    const current = images[index];

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* Top Toolbar */}
            <div className="absolute top-6 right-6 z-[60] flex gap-3">
                <button
                    id="action-download"
                    className="p-4 bg-white/5 hover:bg-emerald-500/20 rounded-full text-white/40 hover:text-emerald-400 transition-all backdrop-blur-md border border-white/5 group shadow-xl"
                    onClick={() => downloadImage(getImageUrl(current.filename, current.subfolder, "output", current.image_data), `character-${current.id}.png`)}
                    title="Download Frame"
                >
                    <Download size={24} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                    id="action-fullscreen"
                    className="p-4 bg-white/5 hover:bg-emerald-500/20 rounded-full text-white/40 hover:text-emerald-400 transition-all backdrop-blur-md border border-white/5 group shadow-xl"
                    onClick={toggleFullscreen}
                    title="Toggle Browser Fullscreen"
                >
                    <Maximize size={24} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                    id="action-close"
                    className="p-4 bg-white/5 hover:bg-red-500/20 rounded-full text-white/40 hover:text-red-400 transition-all backdrop-blur-md border border-white/5 group shadow-xl"
                    onClick={() => window.close()}
                    title="Close Matrix Stream"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* Navigation - PREV */}
            {!isZoomed && (
                <button
                    id="nav-prev"
                    className="absolute left-[10%] md:left-[20%] lg:left-[28%] z-50 p-8 bg-white/5 hover:bg-emerald-500/20 rounded-full text-white/40 hover:text-emerald-400 transition-all backdrop-blur-md border border-white/5 group shadow-2xl"
                    onClick={() => setIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                >
                    <ChevronLeft size={64} className="group-hover:scale-110 transition-transform" />
                </button>
            )}

            {/* Navigation - NEXT */}
            {!isZoomed && (
                <button
                    id="nav-next"
                    className="absolute right-[10%] md:right-[20%] lg:right-[28%] z-50 p-8 bg-white/5 hover:bg-emerald-500/20 rounded-full text-white/40 hover:text-emerald-400 transition-all backdrop-blur-md border border-white/5 group shadow-2xl"
                    onClick={() => setIndex(prev => (prev + 1) % images.length)}
                >
                    <ChevronRight size={64} className="group-hover:scale-110 transition-transform" />
                </button>
            )}

            {/* Image Container with Cinematic Zoom/Fade Effect */}
            <div className={`w-full h-full transition-all duration-500 flex ${isZoomed ? 'overflow-y-auto overflow-x-hidden cursor-zoom-out items-start justify-center' : 'p-2 md:p-8 overflow-hidden items-center justify-center'}`}>
                <div
                    className={`relative group flex items-center justify-center transition-all duration-700 ease-in-out ${isZoomed ? 'scale-[2.5] origin-top cursor-zoom-out py-[10vh]' : 'h-full w-full'}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                >
                    {/* Glowing effect in background */}
                    <div className={`absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full scale-90 animate-pulse pointer-events-none transition-opacity duration-500 ${isZoomed ? 'opacity-0' : 'opacity-100'}`} />

                    <img
                        id={`view-image-${current.id}`}
                        key={current.id}
                        src={getImageUrl(current.filename, current.subfolder, "output", current.image_data)}
                        alt="Cinematic Matrix View"
                        className={`relative object-contain transition-all duration-700 ease-in-out select-none shadow-[0_0_100px_rgba(0,0,0,0.9)] 
                            ${isZoomed ? 'max-h-none h-auto w-[600px] rounded-sm border-none shadow-none' : 'max-h-[94vh] w-auto rounded-2xl border border-white/5 cursor-zoom-in animate-in fade-in zoom-in-95'}`}
                    />
                </div>
            </div>

            {/* Matrix Stylized Controls */}
            {!isZoomed && (
                <div className="absolute bottom-12 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <button
                        id="btn-confirm-selection"
                        className="px-16 py-5 bg-black/60 hover:bg-emerald-500/5 text-emerald-400 text-[11px] font-black italic uppercase tracking-[0.4em] rounded-xl border border-emerald-500/20 hover:border-emerald-400 transition-all duration-300 backdrop-blur-3xl group/btn relative overflow-hidden flex items-center justify-center min-w-[320px] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        onClick={() => {
                            localStorage.setItem("wizard_selected_image", JSON.stringify(current));
                            window.close();
                        }}
                    >
                        {/* Tactical Accents */}
                        <div className="absolute top-0 left-0 w-2 h-[1px] bg-emerald-500/50" />
                        <div className="absolute top-0 left-0 w-[1px] h-2 bg-emerald-500/50" />
                        <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-emerald-500/50" />
                        <div className="absolute bottom-0 right-0 w-[1px] h-2 bg-emerald-500/50" />

                        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">Confirm Selection</span>

                        {/* Scanning Line */}
                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-emerald-500 group-hover/btn:w-full transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,1)]" />
                    </button>
                </div>
            )}
        </div>
    );
}



export default function ViewPage() {
    return (
        <Suspense fallback={<div className="bg-black min-h-screen" />}>
            <ViewContent />
        </Suspense>
    );
}
