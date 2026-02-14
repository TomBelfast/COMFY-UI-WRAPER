
"use client";

import { useGalleryLogic } from "@/hooks/useGalleryLogic";
import { GalleryItem } from "@/lib/api";
import GalleryHeader from "./SubComponents/GalleryHeader";
import GalleryGrid from "./SubComponents/GalleryGrid";
import GalleryLightbox from "./SubComponents/GalleryLightbox";

interface GalleryProps {
    id?: string;
    refreshTrigger: number;
    onSelect: (item: GalleryItem) => void;
}

export default function Gallery({ id = "main-gallery", refreshTrigger, onSelect }: GalleryProps) {
    const g = useGalleryLogic(refreshTrigger);

    return (
        <div id={id} className="glass-card p-6 animate-fade-in-up stagger-3">
            <span className="text-label">Your Creation</span>

            <GalleryHeader
                searchTerm={g.searchTerm}
                onSearchChange={g.setSearchTerm}
                onClearAll={g.handleClearAll}
            />

            <GalleryGrid
                loading={g.loading}
                images={g.filteredImages}
                onImageClick={g.setSelectedImage}
                onDelete={g.handleDelete}
            />

            {g.selectedImage && (
                <GalleryLightbox
                    item={g.selectedImage}
                    images={g.filteredImages}
                    currentIndex={g.currentIndex}
                    onClose={() => g.setSelectedImage(null)}
                    onNext={g.handleNext}
                    onPrev={g.handlePrev}
                    onSelect={g.setSelectedImage}
                    onDelete={g.handleDelete}
                    onCopy={g.copyPrompt}
                    copied={g.copied}
                    onReuse={(item) => {
                        onSelect(item);
                        g.setSelectedImage(null);
                    }}
                />
            )}
        </div>
    );
}
