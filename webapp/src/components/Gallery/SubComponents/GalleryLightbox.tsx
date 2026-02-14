
"use client";

import { useEffect } from "react";
import { GalleryItem, getImageUrl, getThumbnailUrl } from "@/lib/api";
import { downloadImage } from "@/lib/utils";
import { Download } from "lucide-react";

interface GalleryLightboxProps {
    item: GalleryItem;
    images: GalleryItem[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSelect: (item: GalleryItem) => void;
    onDelete: (id: number) => void;
    onCopy: () => void;
    copied: boolean;
    onReuse: (item: GalleryItem) => void;
}

export default function GalleryLightbox({
    item,
    images,
    currentIndex,
    onClose,
    onNext,
    onPrev,
    onSelect,
    onDelete,
    onCopy,
    copied,
    onReuse
}: GalleryLightboxProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev, onClose]);

    return (
        <div id="gallery-lightbox-overlay" className="fixed inset-0 z-[100] bg-black animate-fade-in flex flex-col md:flex-row" onClick={onClose}>
            {/* Main Image Area */}
            <div id="lightbox-main-area" className="flex-1 relative flex flex-col items-center justify-center p-4 bg-black/95 cursor-zoom-out overflow-hidden">
                <button
                    id="lightbox-prev-btn"
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-6 z-20 p-4 bg-black/40 hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 rounded-full backdrop-blur-md border border-white/5 hover:border-emerald-500/50 transition-all group"
                >
                    <svg className="w-8 h-8 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>

                <button
                    id="lightbox-next-btn"
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-6 z-20 p-4 bg-black/40 hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 rounded-full backdrop-blur-md border border-white/5 hover:border-emerald-500/50 transition-all group"
                >
                    <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>

                <img
                    id="lightbox-display-image"
                    key={item.id}
                    src={getImageUrl(item.filename, item.subfolder)}
                    alt={item.prompt_positive}
                    className="max-w-full max-h-[85%] object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                />

                <div id="lightbox-index-indicator" className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-emerald-500 font-mono tracking-widest uppercase">
                    CREATION {currentIndex + 1} / {images.length}
                </div>

                {/* Thumbnail Strip */}
                <div id="lightbox-thumbnails-strip" className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-10" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2 max-w-full overflow-x-auto pb-2 px-2 custom-scrollbar mask-fade-edges">
                        {images.map((img, idx) => (
                            <div
                                id={`lightbox-thumb-${img.id}`}
                                key={img.id}
                                onClick={() => onSelect(img)}
                                className={`w-14 h-20 flex-shrink-0 cursor-pointer rounded border-2 transition-all ${idx === currentIndex ? 'border-emerald-500 scale-110' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                            >
                                <img
                                    src={getThumbnailUrl(img.filename, img.subfolder, 100)}
                                    className="w-full h-full object-cover rounded-sm"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    id="lightbox-close-btn"
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-full p-2 backdrop-blur-md transition-all border border-white/10 hover:border-red-500/50 z-[110]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Side Panel: Metadata */}
            <div
                id="lightbox-metadata-panel"
                className="w-full md:w-80 lg:w-96 bg-matrix-dark/95 border-l border-white/10 flex flex-col h-[40vh] md:h-full backdrop-blur-2xl shadow-2xl z-40"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h3 className="text-sm font-bold text-white tracking-[0.2em] uppercase">METADATA</h3>
                    <div className="flex gap-2">
                        <button
                            id="lightbox-download-action"
                            onClick={() => downloadImage(getImageUrl(item.filename, item.subfolder), `creation-${item.id}.png`)}
                            className="p-1.5 border border-white/20 text-white/60 hover:border-emerald-500/50 hover:text-emerald-400 rounded-md transition-all"
                            title="Download Creation"
                        >
                            <Download size={14} />
                        </button>
                        <button
                            id="lightbox-copy-btn"
                            onClick={onCopy}
                            className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border transition-all ${copied ? 'bg-emerald-500 text-black border-emerald-500 font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'}`}
                        >
                            {copied ? 'COPIED' : 'COPY'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                    <div id="metadata-section-positive" className="space-y-3">
                        <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold block border-l-2 border-emerald-500/30 pl-2">Positive Prompt</label>
                        <p className="text-sm text-white/80 leading-relaxed font-light italic">"{item.prompt_positive}"</p>
                    </div>

                    {item.prompt_negative && (
                        <div id="metadata-section-negative" className="space-y-3 opacity-60">
                            <label className="text-[10px] text-red-400/50 uppercase tracking-widest font-bold block border-l-2 border-red-400/20 pl-2">Negative Prompt</label>
                            <p className="text-xs text-white/50 leading-relaxed">{item.prompt_negative}</p>
                        </div>
                    )}

                    <div id="metadata-grid" className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 group hover:border-emerald-500/30 transition-colors">
                            <span className="text-[9px] text-white/30 uppercase block mb-1">Hardware / Model</span>
                            <span className="text-[11px] text-white/90 truncate block font-mono">{item.model}</span>
                        </div>
                        <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 group hover:border-emerald-500/30 transition-colors">
                            <span className="text-[9px] text-white/30 uppercase block mb-1">Canvas Resolution</span>
                            <span className="text-[11px] text-white/90 font-mono">{item.width} x {item.height}</span>
                        </div>
                    </div>

                    <div id="cinematic-verified-badge" className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                        <span className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Cinematic Matrix Verified</span>
                    </div>
                </div>

                <div id="lightbox-footer-actions" className="p-4 border-t border-white/10 flex gap-2 bg-black/20">
                    <button
                        id="lightbox-reuse-btn"
                        onClick={() => onReuse(item)}
                        className="flex-1 btn-primary py-4 text-[10px] uppercase tracking-[0.2em] font-black shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                        Reuse Parameters
                    </button>
                    <button
                        id="lightbox-purge-btn"
                        onClick={() => { onDelete(item.id); onClose(); }}
                        className="px-5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-white/20 rounded-lg transition-all"
                        title="Purge Record"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
