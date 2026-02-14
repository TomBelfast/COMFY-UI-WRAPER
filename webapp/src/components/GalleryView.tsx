
import React, { useEffect, useState } from 'react';
import { GalleryItem, fetchGallery, deleteFromGallery, clearGallery, getImageUrl } from '@/lib/api';

interface GalleryViewProps {
    refreshTrigger: number;
    onSelect: (item: GalleryItem) => void;
    positivePrompt: string;
    setPositivePrompt: (val: string) => void;
    negativePrompt: string;
    setNegativePrompt: (val: string) => void;
    handleGenerate: () => void;
    isGenerating: boolean;
    progress?: { value: number; max: number };
}

export default function GalleryView({
    refreshTrigger,
    onSelect,
    positivePrompt,
    setPositivePrompt,
    negativePrompt,
    setNegativePrompt,
    handleGenerate,
    isGenerating,
    progress = { value: 0, max: 1 }
}: GalleryViewProps) {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadGallery();
    }, [refreshTrigger]);

    // Auto-select the newest image after generation completes
    const prevRefreshTrigger = React.useRef(refreshTrigger);
    useEffect(() => {
        if (refreshTrigger > prevRefreshTrigger.current) {
            // Give a small delay to ensure images are loaded
            loadGallery().then((newImages) => {
                if (newImages && newImages.length > 0) {
                    // Force select the first one (newest)
                    setSelectedImage(newImages[0]);
                }
            });
        }
        prevRefreshTrigger.current = refreshTrigger;
    }, [refreshTrigger]);

    const loadGallery = async () => {
        setLoading(true);
        try {
            const data = await fetchGallery();
            // Sort by newest first
            const sorted = data.sort((a: GalleryItem, b: GalleryItem) => b.id - a.id);
            setImages(sorted);
            return sorted;
        } catch (e) {
            console.error(e);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this image from history? (File remains on disk)")) {
            await deleteFromGallery(id);
            loadGallery();
        }
    };

    const handleClearAll = async () => {
        if (confirm("Are you SURE you want to clear the entire gallery history? (Files will remain on disk, only database records will be removed)")) {
            await clearGallery();
            loadGallery();
        }
    };

    const filteredImages = images.filter(img =>
        img.prompt_positive.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [copied, setCopied] = useState(false);

    // When an image is selected, we sync its data to the global logic state
    useEffect(() => {
        if (selectedImage) {
            setPositivePrompt(selectedImage.prompt_positive);
            setNegativePrompt(selectedImage.prompt_negative || "");
        }
    }, [selectedImage]);

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

    const copyMetadata = () => {
        if (selectedImage) {
            const metadataText = `Positive Prompt: ${selectedImage.prompt_positive}
${selectedImage.prompt_negative ? `Negative Prompt: ${selectedImage.prompt_negative}` : ''}
Model: ${selectedImage.model}
Resolution: ${selectedImage.width}x${selectedImage.height}
Steps: ${selectedImage.steps}
CFG: ${selectedImage.cfg}
---
Generated via Cinematic Matrix`.trim();

            navigator.clipboard.writeText(metadataText);
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

                    {/* Search & Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleClearAll}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 px-3 py-1 rounded text-[10px] uppercase font-bold transition-all"
                        >
                            Clear History
                        </button>
                        <input
                            type="text"
                            placeholder="Search prompts..."
                            className="input-glass py-1 px-3 text-xs w-32 border-white/10 bg-white/5 focus:border-emerald-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            suppressHydrationWarning
                        />
                    </div>
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
                                    <button
                                        onClick={(e) => handleDelete(img.id, e)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-md border border-white/10 hover:border-red-500/50 transition-all"
                                        title="Delete from history"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
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
                <div className="fixed inset-0 z-[100] bg-[#121212] animate-fade-in flex flex-col md:flex-row overflow-hidden" onClick={() => setSelectedImage(null)}>
                    {/* Synchronized Global Grid UNDER everything */}
                    <div className="absolute inset-0 bg-matrix opacity-20 pointer-events-none" />

                    {/* Main Image Area - Luminous Atmosphere */}
                    <div className="flex-1 relative flex flex-col items-center justify-center p-4 cursor-zoom-out overflow-hidden">
                        {/* Background Layer (Explicitly Behind EVERYTHING) */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                            <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-[2px]" />
                        </div>

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

                        <div className={`relative z-20 mb-20 transition-all duration-700 ease-out ${isGenerating ? 'scale-95' : 'scale-100'}`}>
                            {/* Aura Glow Effect */}
                            <div className={`absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full transition-opacity duration-1000 z-0 ${isGenerating ? 'opacity-100 animate-aura-pulse' : 'opacity-0'}`} />

                            {/* Snake Border Container */}
                            {isGenerating && (
                                <div className="absolute -inset-[3px] rounded-lg overflow-hidden pointer-events-none z-0">
                                    <div className="absolute inset-[-50%] bg-[conic-gradient(transparent_0deg,transparent_90deg,#10b981_180deg,transparent_270deg)] animate-[spin_4s_linear_infinite]" />
                                </div>
                            )}

                            <div className={`relative rounded-lg overflow-hidden bg-[#121212] z-10 ${isGenerating ? 'p-[2px]' : ''}`}>
                                <img
                                    key={selectedImage.id}
                                    src={getImageUrl(selectedImage.filename, selectedImage.subfolder)}
                                    alt={selectedImage.prompt_positive}
                                    className={`max-w-full max-h-[72vh] object-contain shadow-[0_30px_100px_rgba(0,0,0,0.5)] transition-all duration-1000 ${isGenerating ? 'opacity-40 blur-[4px] grayscale-[0.5]' : 'opacity-100 blur-0 grayscale-0 animate-matrix-decode'}`}
                                    onClick={(e) => e.stopPropagation()}
                                />

                                {/* Progress Overlay */}
                                {isGenerating && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                                        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4 relative">
                                            <div
                                                className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-300 ease-out relative z-10"
                                                style={{ width: `${(progress.value / (progress.max || 1)) * 100}%` }}
                                            />
                                            {/* Progress Glow */}
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-md" style={{ width: `${(progress.value / (progress.max || 1)) * 100}%` }} />
                                        </div>
                                        <div className="text-emerald-400 font-mono text-sm tracking-widest uppercase animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                                            Matrix Generation {((progress.value / (progress.max || 1)) * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

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

                    {/* Side Panel */}
                    <div
                        className="w-full md:w-80 lg:w-[450px] bg-white/[0.06] backdrop-blur-[60px] border-l border-white/[0.15] flex flex-col h-[60vh] md:h-full z-40 relative overflow-hidden shadow-[-20px_0_100px_rgba(0,0,0,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Matrix Grid Overlay (Local accent) */}
                        <div className="absolute inset-0 bg-matrix opacity-10 pointer-events-none" />
                        <div className="p-6 border-b border-white/[0.1] flex justify-between items-center bg-white/[0.04] backdrop-blur-md relative z-10">
                            <h3 className="text-title text-xl tracking-[0.4em]">Gallery View</h3>
                            <button
                                onClick={copyMetadata}
                                className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border transition-all ${copied ? 'bg-emerald-500 text-black border-emerald-500 font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'}`}
                            >
                                {copied ? 'COPIED' : 'COPY'}
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col p-4 gap-4 relative min-h-0">
                            <div className="flex-1 flex flex-col min-h-0 gap-2">
                                <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1 flex-shrink-0">
                                    <label className="text-label !text-emerald-400">Neural Sequence (Positive)</label>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(positivePrompt);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1500);
                                        }}
                                        className="text-[9px] text-emerald-500/50 hover:text-emerald-400 uppercase tracking-tighter transition-colors"
                                    >
                                        [Quick Copy]
                                    </button>
                                </div>
                                <textarea
                                    value={positivePrompt}
                                    onChange={(e) => setPositivePrompt(e.target.value)}
                                    className="flex-1 w-full text-[13px] text-white/95 leading-relaxed bg-white/[0.04] p-3 rounded-xl border border-white/[0.08] italic shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] focus:border-emerald-500/30 focus:outline-none resize-none custom-scrollbar"
                                />
                            </div>

                            <div className="flex-shrink-0 h-[80px] flex flex-col gap-1">
                                <div className="flex justify-between items-center border-b border-red-500/10 pb-1">
                                    <label className="text-label !text-red-400">Neural Rejection</label>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(negativePrompt);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1500);
                                        }}
                                        className="text-[9px] text-red-500/50 hover:text-red-400 uppercase tracking-tighter transition-colors"
                                    >
                                        [Quick Copy]
                                    </button>
                                </div>
                                <textarea
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    className="flex-1 w-full text-[11px] text-white/70 leading-relaxed bg-red-500/[0.02] p-2 rounded-xl border border-red-500/10 focus:border-red-500/30 focus:outline-none resize-none custom-scrollbar"
                                />
                            </div>

                            <div className="flex-shrink-0 space-y-2">
                                <div className="p-2.5 bg-white/[0.04] rounded-xl border border-white/[0.1] group hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300">
                                    <span className="text-label !text-[9px] !text-emerald-400 block mb-1">Active Neural Model</span>
                                    <span className="text-[10px] text-white font-mono font-bold break-all block leading-tight">{selectedImage.model}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-2.5 bg-white/[0.04] rounded-xl border border-white/[0.1] group hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300">
                                        <span className="text-label !text-[8px] !text-emerald-400 block mb-1">Resolution</span>
                                        <span className="text-[10px] text-white/90 font-mono font-bold block">{selectedImage.width}x{selectedImage.height}</span>
                                    </div>
                                    <div className="p-2.5 bg-white/[0.04] rounded-xl border border-white/[0.1] group hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300">
                                        <span className="text-label !text-[8px] !text-emerald-400 block mb-1">Steps</span>
                                        <span className="text-[10px] text-white/90 font-mono font-bold block">{selectedImage.steps}</span>
                                    </div>
                                    <div className="p-2.5 bg-white/[0.04] rounded-xl border border-white/[0.1] group hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300">
                                        <span className="text-label !text-[8px] !text-emerald-400 block mb-1">CFG</span>
                                        <span className="text-[10px] text-emerald-400 font-mono font-black block">{selectedImage.cfg}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-4 border-t border-white/10 flex flex-col gap-3 bg-black/40 backdrop-blur-xl">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className={`w-full py-5 relative group overflow-hidden rounded-xl transition-all duration-500 transform-gpu ${isGenerating
                                    ? 'bg-white/5 border border-white/10 cursor-not-allowed scale-[0.98]'
                                    : 'bg-emerald-500 border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3),0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_#10b981,0_15px_45px_rgba(0,0,0,0.6)] hover:-translate-y-1 active:translate-y-0.5'
                                    }`}
                            >
                                {isGenerating ? (
                                    <div className="relative flex items-center justify-center gap-4 z-10">
                                        <div className="relative w-5 h-5">
                                            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
                                            <div className="absolute inset-0 border-2 border-t-emerald-500 rounded-full animate-spin" />
                                        </div>
                                        <div className="flex flex-col items-start leading-none text-left">
                                            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400 animate-pulse">Initializing</span>
                                            <span className="text-[7px] uppercase tracking-[0.1em] text-white/30 font-mono mt-1">Neural Pattern Re-Sync</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Luxury Shine Sweep */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out z-0" />
                                        <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 z-0" />

                                        <div className="relative flex items-center justify-center gap-3 z-10">
                                            <div className="p-1 px-1.5 bg-black/20 rounded border border-black/10 transition-transform group-hover:scale-110">
                                                <svg className="w-4 h-4 text-black group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col items-start text-left leading-none">
                                                <span className="text-[11px] uppercase tracking-[0.4em] font-black text-black group-hover:text-white transition-colors duration-300">
                                                    Instant Re-Generate
                                                </span>
                                                <span className="text-[7px] uppercase tracking-[0.2em] text-black/40 group-hover:text-white/40 font-mono mt-1">
                                                    Execute Matrix Sequence
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        onSelect(selectedImage);
                                        setSelectedImage(null);
                                    }}
                                    className="flex-1 py-3 text-[9px] uppercase tracking-widest font-bold border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-white/60 hover:text-emerald-400 rounded-lg"
                                >
                                    Load to Panel
                                </button>
                                <button
                                    onClick={(e) => {
                                        handleDelete(selectedImage.id, e);
                                        setSelectedImage(null);
                                    }}
                                    className="px-4 border border-white/5 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-white/10 rounded-lg transition-all"
                                    title="Purge Record"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
