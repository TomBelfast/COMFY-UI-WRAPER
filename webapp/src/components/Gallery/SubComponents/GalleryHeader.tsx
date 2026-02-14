
"use client";

interface GalleryHeaderProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onClearAll: () => void;
}

export default function GalleryHeader({ searchTerm, onSearchChange, onClearAll }: GalleryHeaderProps) {
    return (
        <div id="gallery-header-controls" className="flex justify-between items-center mb-4">
            <h3 id="gallery-title" className="text-title text-xl mt-2">Gallery</h3>

            <div id="gallery-actions-container" className="flex gap-2">
                <button
                    id="clear-gallery-btn"
                    onClick={onClearAll}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 px-3 py-1 rounded text-[10px] uppercase font-bold transition-all"
                >
                    Clear History
                </button>
                <input
                    id="gallery-search-input"
                    type="text"
                    placeholder="Search prompts..."
                    className="input-glass py-1 px-3 text-xs w-32 border-white/10 bg-white/5 focus:border-emerald-500/50"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    suppressHydrationWarning
                />
            </div>
        </div>
    );
}
