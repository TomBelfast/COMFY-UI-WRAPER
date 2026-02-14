import React, { useState, useRef, useEffect } from 'react';
import { GalleryItem, getImageUrl } from '@/lib/api';

interface ComparisonSliderProps {
    original: GalleryItem;
    upscaled: GalleryItem;
    className?: string; // Allow styling from parent
}

export default function ComparisonSlider({ original, upscaled, className = "" }: ComparisonSliderProps) {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);

    // Zoom & Pan state
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    const beforeUrl = getImageUrl(original.filename, original.subfolder, "output", original.image_data);
    const afterUrl = getImageUrl(upscaled.filename, upscaled.subfolder, "output", upscaled.image_data);

    // --- ZOOM LOGIC ---
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = e.deltaY * -0.002;
        const newScale = Math.min(Math.max(1, scale + delta), 8); // Max 8x zoom

        setScale(newScale);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
    };

    // --- PANNING LOGIC ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.slider-handle')) return;
        if (scale > 1) {
            setIsPanning(true);
            setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning && scale > 1) {
            setPosition({
                x: e.clientX - startPan.x,
                y: e.clientY - startPan.y
            });
        }

        if (isDraggingSlider && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calculate position relative to the container center/transform?
            // Actually, for the slider logic, we want position relative to the VISIBLE image frame.
            // But since the slider moves WITH the image transformation, 
            // the percent calculation must be based on the TRANSFORMED width on screen.

            // Wait, if the container transforms, rect gives the transformed size.
            // The X coordinate within that rect is what matters.
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percent = (x / rect.width) * 100;
            setSliderPos(percent);
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setIsDraggingSlider(false);
    };

    // --- SLIDER LOGIC ---
    const handleSliderMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDraggingSlider(true);
    };

    // Global events
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsPanning(false);
            setIsDraggingSlider(false);
        };
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDraggingSlider && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percent = (x / rect.width) * 100;
                setSliderPos(percent);
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [isDraggingSlider]);


    return (
        <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair select-none ${className}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Main Transform Container */}
            <div
                ref={containerRef}
                className="relative max-w-full max-h-full shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    transformOrigin: 'center',
                }}
            >
                {/* AFTER Image (Background) - UPSCALED */}
                <img
                    src={afterUrl}
                    className="max-w-full max-h-[72vh] object-contain pointer-events-none select-none block"
                    draggable={false}
                />

                {/* BEFORE Image (Foreground) - ORIGINAL - Clipped */}
                <div
                    className="absolute inset-0 overflow-hidden select-none"
                    style={{
                        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                    }}
                >
                    <img
                        src={beforeUrl}
                        className="w-full h-full object-contain pointer-events-none select-none block"
                        draggable={false}
                    />

                    {/* Label: Original */}
                    <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur text-[9px] uppercase text-white/70 rounded border border-white/10 pointer-events-none transform-gpu" style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top left' }}>
                        Before ({original.width}x{original.height})
                    </div>
                </div>

                {/* Label: Upscaled */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-900/60 backdrop-blur text-[9px] uppercase text-emerald-400 rounded border border-emerald-500/30 pointer-events-none transform-gpu" style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top right' }}>
                    After ({upscaled.width}x{upscaled.height})
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute inset-y-0 w-1 bg-white/20 cursor-col-resize z-10 hover:bg-emerald-400 transition-colors slider-handle group"
                    style={{ left: `${sliderPos}%` }}
                    onMouseDown={handleSliderMouseDown}
                >
                    {/* Handle Circle - counteract zoom scale to keep size constant-ish */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-black/50 backdrop-blur border border-white/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        style={{ transform: `translate(-50%, -50%) scale(${1 / scale})` }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M15 18l-6-6 6-6" /></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white rotate-180"><path d="M15 18l-6-6 6-6" /></svg>
                    </div>
                    <div className="absolute inset-y-0 -left-px w-[1px] bg-emerald-500/50 shadow-[0_0_10px_#10b981]" />
                </div>
            </div>

            {/* Instructions Overlay (fades out) - Outside transform */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-[10px] text-white/30 uppercase tracking-widest animate-pulse">
                Scroll to Zoom • Drag to Pan
            </div>
        </div>
    );
}
