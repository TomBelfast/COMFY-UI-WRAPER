
import React, { useEffect, useState } from 'react';
import { GalleryItem, fetchGallery, deleteFromGallery, getImageUrl } from '@/lib/api';

interface GalleryProps {
    refreshTrigger: number;
    onSelect: (item: GalleryItem) => void;
}

export default function Gallery({ refreshTrigger, onSelect }: GalleryProps) {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadGallery();
    }, [refreshTrigger]);

    const loadGallery = async () => {
        setLoading(true);
        const data = await fetchGallery();
        setImages(data);
        setLoading(false);
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this image from history? (File remains on disk)")) {
            await deleteFromGallery(id);
            loadGallery();
        }
    };

    const filteredImages = images.filter(img =>
        img.prompt_positive.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [copied, setCopied] = useState(false);

    // Navigation Logic
    const currentIndex = selectedImage ? filteredImages.findIndex(img => img.id === selectedImage.id) : -1;

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < filteredImages.length - 1) {
            setSelectedImage(filteredImages[currentIndex + 1]);
        } else {
            setSelectedImage(filteredImages[0]); // Loop
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setSelectedImage(filteredImages[currentIndex - 1]);
        } else {
            setSelectedImage(filteredImages[filteredImages.length - 1]); // Loop
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedImage) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, currentIndex, filteredImages]);

    const copyPrompt = () => {
        if (selectedImage?.prompt_positive) {
            navigator.clipboard.writeText(selectedImage.prompt_positive);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <div className="glass-card p-6 animate-fade-in-up stagger-3">
                <span className="text-label">Your Creation</span>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-title text-xl mt-2">Gallery</h3>

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search prompts..."
                        className="input-glass py-1 px-3 text-xs w-32 border-white/10 bg-white/5 focus:border-emerald-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        suppressHydrationWarning
                    />
                </div>

                {loading ? (
                    <div className="text-sm text-white/50 animate-pulse">Loading gallery...</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredImages.length === 0 && (
                            <div className="col-span-full text-center text-xs text-white/30 py-8">
                                {images.length === 0 ? "No images yet. Start creating!" : "No matching images found."}
                            </div>
                        )}
                        {filteredImages.map(img => (
                            <div
                                key={img.id}
                                className={`relative group rounded-lg overflow-hidden bg-black/20 cursor-pointer border border-white/5 hover:border-emerald-500/50 transition-all ${img.prompt_positive.toLowerCase().includes(searchTerm.toLowerCase()) ? '' : 'opacity-50 grayscale'
                                    }`}
                                style={{ aspectRatio: `${img.width} / ${img.height}` }}
                                onClick={() => setSelectedImage(img)}
                            >
                                <img
                                    src={getImageUrl(img.filename, img.subfolder)}
                                    alt={img.prompt_positive}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                    <p className="text-[10px] text-white/80 line-clamp-2 leading-tight mb-1">
                                        {img.prompt_positive}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[9px] text-emerald-400 font-mono">{img.width}x{img.height}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen UI */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black animate-fade-in flex flex-col md:flex-row" onClick={() => setSelectedImage(null)}>

                    {/* Main Image Area */}
                    <div className="flex-1 relative flex flex-col items-center justify-center p-4 bg-black/95 cursor-zoom-out overflow-hidden">

                        {/* Nav Buttons */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-6 z-20 p-4 bg-black/40 hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 rounded-full backdrop-blur-md border border-white/5 hover:border-emerald-500/50 transition-all group"
                        >
                            <svg className="w-8 h-8 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <button
                            onClick={handleNext}
                            className="absolute right-6 z-20 p-4 bg-black/40 hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 rounded-full backdrop-blur-md border border-white/5 hover:border-emerald-500/50 transition-all group"
                        >
                            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        <img
                            key={selectedImage.id}
                            src={getImageUrl(selectedImage.filename, selectedImage.subfolder)}
                            alt={selectedImage.prompt_positive}
                            className="max-w-full max-h-[85%] object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-in"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Image Index Indicator */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-emerald-500 font-mono tracking-widest uppercase">
                            CREATION {currentIndex + 1} / {filteredImages.length}
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-10" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-2 max-w-full overflow-x-auto pb-2 px-2 custom-scrollbar mask-fade-edges">
                                {filteredImages.map((img, idx) => (
                                    <div
                                        key={img.id}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-14 h-20 flex-shrink-0 cursor-pointer rounded border-2 transition-all ${idx === currentIndex ? 'border-emerald-500 scale-110' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                                    >
                                        <img
                                            src={getImageUrl(img.filename, img.subfolder)}
                                            className="w-full h-full object-cover rounded-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 z-30">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-full p-2 backdrop-blur-md transition-all border border-white/10 hover:border-red-500/50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>

                    {/* Side Panel (Collapsible/Overlay on Mobile) */}
                    <div
                        className="w-full md:w-80 lg:w-96 bg-matrix-dark/95 border-l border-white/10 flex flex-col h-[40vh] md:h-full backdrop-blur-2xl shadow-2xl z-40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <h3 className="text-sm font-bold text-white tracking-[0.2em] uppercase">METADATA</h3>
                            <button
                                onClick={copyPrompt}
                                className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border transition-all ${copied ? 'bg-emerald-500 text-black border-emerald-500 font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'}`}
                            >
                                {copied ? 'COPIED' : 'COPY'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold block border-l-2 border-emerald-500/30 pl-2">Positive Prompt</label>
                                <p className="text-sm text-white/80 leading-relaxed font-light italic">
                                    "{selectedImage.prompt_positive}"
                                </p>
                            </div>

                            {selectedImage.prompt_negative && (
                                <div className="space-y-3 opacity-60">
                                    <label className="text-[10px] text-red-400/50 uppercase tracking-widest font-bold block border-l-2 border-red-400/20 pl-2">Negative Prompt</label>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        {selectedImage.prompt_negative}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 group hover:border-emerald-500/30 transition-colors">
                                    <span className="text-[9px] text-white/30 uppercase block mb-1">Hardware / Model</span>
                                    <span className="text-[11px] text-white/90 truncate block font-mono">{selectedImage.model}</span>
                                </div>
                                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 group hover:border-emerald-500/30 transition-colors">
                                    <span className="text-[9px] text-white/30 uppercase block mb-1">Canvas Resolution</span>
                                    <span className="text-[11px] text-white/90 font-mono">{selectedImage.width} x {selectedImage.height}</span>
                                </div>
                                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 group hover:border-emerald-500/30 transition-colors">
                                    <span className="text-[9px] text-white/30 uppercase block mb-1">Sampling Steps</span>
                                    <span className="text-[11px] text-white/90 font-mono">{selectedImage.steps}</span>
                                </div>
                                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 group hover:border-emerald-500/30 transition-colors">
                                    <span className="text-[9px] text-white/30 uppercase block mb-1">CFG Magic</span>
                                    <span className="text-[11px] text-white/90 font-mono">{selectedImage.cfg}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                <span className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Cinematic Matrix Verified</span>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 flex gap-2 bg-black/20">
                            <button
                                onClick={() => {
                                    onSelect(selectedImage);
                                    setSelectedImage(null);
                                }}
                                className="flex-1 btn-primary py-4 text-[10px] uppercase tracking-[0.2em] font-black shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                Reuse Parameters
                            </button>
                            <button
                                onClick={(e) => {
                                    handleDelete(selectedImage.id, e);
                                    setSelectedImage(null);
                                }}
                                className="px-5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-white/20 rounded-lg transition-all"
                                title="Purge Record"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
