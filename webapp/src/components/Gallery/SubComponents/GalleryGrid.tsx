
"use client";

import { GalleryItem, getImageUrl } from "@/lib/api";

interface GalleryGridProps {
    loading: boolean;
    images: GalleryItem[];
    onImageClick: (item: GalleryItem) => void;
    onDelete: (id: number, e: React.MouseEvent) => void;
}

export default function GalleryGrid({ loading, images, onImageClick, onDelete }: GalleryGridProps) {
    if (loading) {
        return <div id="gallery-loading" className="text-sm text-white/50 animate-pulse">Loading gallery...</div>;
    }

    return (
        <div id="gallery-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {images.length === 0 && (
                <div id="gallery-empty-state" className="col-span-full text-center text-xs text-white/30 py-8">
                    No images yet or no matching results.
                </div>
            )}
            {images.map(img => (
                <div
                    id={`gallery-item-${img.id}`}
                    key={img.id}
                    className="relative group rounded-lg overflow-hidden bg-black/20 cursor-pointer border border-white/5 hover:border-emerald-500/50 transition-all"
                    style={{ aspectRatio: `${img.width} / ${img.height}` }}
                    onClick={() => onImageClick(img)}
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
                            id={`delete-image-btn-${img.id}`}
                            onClick={(e) => onDelete(img.id, e)}
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
    );
}
