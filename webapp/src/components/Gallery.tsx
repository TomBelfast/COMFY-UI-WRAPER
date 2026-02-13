import React, { useEffect, useState } from 'react';
import { GalleryItem, fetchGallery, deleteFromGallery, getBackendUrl } from '@/lib/api';

interface GalleryProps {
    refreshTrigger: number;
    onSelect: (item: GalleryItem) => void;
}

export default function Gallery({ refreshTrigger, onSelect }: GalleryProps) {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(false);

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

    // Helper to construct image URL
    const getImageUrl = (filename: string, subfolder: string) => {
        let url = `/api/comfy/image?filename=${filename}&type=output`;
        if (subfolder) url += `&subfolder=${subfolder}`;
        return url;
    };

    return (
        <div className="glass-card p-6 animate-fade-in-up stagger-3">
            <span className="text-label">Your Creation</span>
            <h3 className="text-title text-xl mt-2 mb-4">Gallery</h3>

            {loading ? (
                <div className="text-sm text-white/50 animate-pulse">Loading gallery...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {images.length === 0 && (
                        <div className="col-span-full text-center text-xs text-white/30 py-8">
                            No images yet. Start creating!
                        </div>
                    )}
                    {images.map(img => (
                        <div
                            key={img.id}
                            className="relative group aspect-square rounded-lg overflow-hidden bg-black/20 cursor-pointer border border-white/5 hover:border-emerald-500/50 transition-all"
                            onClick={() => onSelect(img)}
                        >
                            <img
                                src={getImageUrl(img.filename, img.subfolder)}
                                alt={img.prompt_positive}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <p className="text-[10px] text-white/80 line-clamp-2 leading-tight">
                                    {img.prompt_positive}
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[9px] text-emerald-400 font-mono">{img.width}x{img.height}</span>
                                    <button
                                        onClick={(e) => handleDelete(img.id, e)}
                                        className="text-red-400 hover:text-red-300 bg-black/50 rounded px-1.5 py-0.5 text-[10px]"
                                    >
                                        DEL
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
