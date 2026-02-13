
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
                                className={`relative group aspect-[9/16] rounded-lg overflow-hidden bg-black/20 cursor-pointer border border-white/5 hover:border-emerald-500/50 transition-all ${img.prompt_positive.toLowerCase().includes(searchTerm.toLowerCase()) ? '' : 'opacity-50 grayscale'
                                    }`}
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

            {/* Fullscreen Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-7xl w-full max-h-[95vh] flex flex-col md:flex-row gap-6 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>

                        {/* Image Container */}
                        <div className="flex-1 flex items-center justify-center bg-black/50 rounded-xl overflow-hidden relative">
                            <img
                                src={getImageUrl(selectedImage.filename, selectedImage.subfolder)}
                                alt={selectedImage.prompt_positive}
                                className="max-w-full max-h-[85vh] object-contain"
                            />
                        </div>

                        {/* Details Panel */}
                        <div className="w-full md:w-96 flex flex-col gap-4 p-4 overflow-y-auto max-h-[40vh] md:max-h-[85vh]">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white">Image Details</h3>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs text-white/40 uppercase tracking-wider block">Prompt</label>
                                        <button
                                            onClick={copyPrompt}
                                            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="text-sm text-white/90 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                                        {selectedImage.prompt_positive}
                                    </p>
                                </div>

                                {selectedImage.prompt_negative && (
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Negative Prompt</label>
                                        <p className="text-sm text-white/70 bg-white/5 p-2 rounded-lg border border-white/5">
                                            {selectedImage.prompt_negative}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-white/40 block">Model</span>
                                        <span className="text-white/90 truncate block" title={selectedImage.model}>{selectedImage.model}</span>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-white/40 block">Dimensions</span>
                                        <span className="text-white/90">{selectedImage.width} x {selectedImage.height}</span>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-white/40 block">Steps</span>
                                        <span className="text-white/90">{selectedImage.steps}</span>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-white/40 block">CFG</span>
                                        <span className="text-white/90">{selectedImage.cfg}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
                                <button
                                    onClick={() => {
                                        onSelect(selectedImage);
                                        setSelectedImage(null);
                                    }}
                                    className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
                                >
                                    <span>⚡ Reuse Settings</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        handleDelete(selectedImage.id, e);
                                        setSelectedImage(null);
                                    }}
                                    className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
