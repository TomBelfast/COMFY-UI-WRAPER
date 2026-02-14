"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getImageUrl, GalleryItem } from "@/lib/api";

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
            {/* Close Page Action */}
            <button
                className="absolute top-6 right-6 z-[60] p-4 bg-white/5 hover:bg-red-500/20 rounded-full text-white/20 hover:text-red-400 transition-all backdrop-blur-md border border-white/5 group"
                onClick={() => window.close()}
                title="Close Stream"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            {/* Navigation - PREV */}
            {!isZoomed && (
                <button
                    className="absolute left-[10%] md:left-[20%] lg:left-[28%] z-50 p-8 bg-white/5 hover:bg-emerald-500/20 rounded-full text-white/40 hover:text-emerald-400 transition-all backdrop-blur-md border border-white/5 group shadow-2xl"
                    onClick={() => setIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
            )}

            {/* Navigation - NEXT */}
            {!isZoomed && (
                <button
                    className="absolute right-[10%] md:right-[20%] lg:right-[28%] z-50 p-8 bg-white/5 hover:bg-emerald-500/20 rounded-full text-white/40 hover:text-emerald-400 transition-all backdrop-blur-md border border-white/5 group shadow-2xl"
                    onClick={() => setIndex(prev => (prev + 1) % images.length)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
                        key={current.id}
                        src={getImageUrl(current.filename, current.subfolder)}
                        alt="Cinematic Matrix View"
                        className={`relative object-contain transition-all duration-700 ease-in-out select-none shadow-[0_0_100px_rgba(0,0,0,0.9)] 
                            ${isZoomed ? 'max-h-none h-auto w-[600px] rounded-sm border-none shadow-none' : 'max-h-[94vh] w-auto rounded-2xl border border-white/5 cursor-zoom-in animate-in fade-in zoom-in-95'}`}
                    />
                </div>
            </div>

            {/* Matrix Stylized Controls */}
            {!isZoomed && (
                <div className="absolute bottom-10 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <button
                        className="px-12 py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:bg-emerald-400 transition-all active:scale-95 group relative overflow-hidden"
                        onClick={() => {
                            localStorage.setItem("wizard_selected_image", JSON.stringify(current));
                            window.close();
                        }}
                    >
                        <span className="relative z-10">Confirm_Selection</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>

                    <div className="px-8 py-3 bg-black/40 rounded-full backdrop-blur-3xl border border-white/5 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                        <span className="text-emerald-500 font-mono text-[10px] tracking-[0.6em] uppercase font-black">
                            PHASE_VARIANT: {index + 1} // {images.length}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    </div>
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
