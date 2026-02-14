
"use client";

interface AspectRatioSelectorProps {
    width: number;
    height: number;
    onSelect: (w: number, h: number) => void;
}

export default function AspectRatioSelector({ width, height, onSelect }: AspectRatioSelectorProps) {
    const ratios = [
        { name: "9:16", w: 1088, h: 1920, iconClass: "w-5 h-8" },
        { name: "1:1", w: 1280, h: 1280, iconClass: "w-7 h-7" },
        { name: "16:9", w: 1920, h: 1088, iconClass: "w-8 h-5" },
    ];

    return (
        <div id="aspect-ratio-selector" className="space-y-2">
            <label className="text-label block mb-2">Aspect Ratio</label>
            <div className="flex gap-3 items-end">
                {ratios.map((r) => (
                    <button
                        id={`ratio-btn-${r.name.replace(':', '-')}`}
                        key={r.name}
                        type="button"
                        onClick={() => onSelect(r.w, r.h)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${width === r.w && height === r.h ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                    >
                        <div className={`${r.iconClass} rounded-sm border-2 ${width === r.w && height === r.h ? 'border-emerald-400' : 'border-white/40'}`} />
                        <span className={`text-[10px] font-mono ${width === r.w && height === r.h ? 'text-emerald-400' : 'text-white/50'}`}>{r.name}</span>
                    </button>
                ))}
                <span id="current-resolution" className="text-[10px] text-white/30 ml-auto font-mono self-center">{width}×{height}</span>
            </div>
        </div>
    );
}
