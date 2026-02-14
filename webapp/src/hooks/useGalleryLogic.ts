
"use client";

import { useState, useEffect } from 'react';
import { GalleryItem, fetchGallery, deleteFromGallery, clearGallery } from '@/lib/api';

export function useGalleryLogic(refreshTrigger: number) {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadGallery();
    }, [refreshTrigger]);

    const loadGallery = async () => {
        setLoading(true);
        try {
            const data = await fetchGallery();
            setImages(data);
        } catch (e) {
            console.error("Gallery: Load failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
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

    const currentIndex = selectedImage ? filteredImages.findIndex(img => img.id === selectedImage.id) : -1;

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < filteredImages.length - 1) {
            setSelectedImage(filteredImages[currentIndex + 1]);
        } else {
            setSelectedImage(filteredImages[0]);
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setSelectedImage(filteredImages[currentIndex - 1]);
        } else {
            setSelectedImage(filteredImages[filteredImages.length - 1]);
        }
    };

    const copyPrompt = () => {
        if (selectedImage?.prompt_positive) {
            navigator.clipboard.writeText(selectedImage.prompt_positive);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return {
        images,
        loading,
        searchTerm,
        setSearchTerm,
        filteredImages,
        selectedImage,
        setSelectedImage,
        currentIndex,
        handleDelete,
        handleClearAll,
        handleNext,
        handlePrev,
        copyPrompt,
        copied
    };
}
