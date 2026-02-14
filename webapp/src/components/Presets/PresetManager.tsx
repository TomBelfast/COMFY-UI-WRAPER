
"use client";

import { GenerationPreset } from "@/lib/api";

interface PresetManagerProps {
    presets: GenerationPreset[];
    onLoad: (preset: GenerationPreset) => void;
    onDelete: (name: string, e: React.MouseEvent) => void;
    onSaveToggle: () => void;
    showSaveDialog: boolean;
    presetName: string;
    onPresetNameChange: (name: string) => void;
    onSaveConfirm: () => void;
}

export default function PresetManager({
    presets,
    onLoad,
    onDelete,
    onSaveToggle,
    showSaveDialog,
    presetName,
    onPresetNameChange,
    onSaveConfirm
}: PresetManagerProps) {
    return (
        <div id="preset-manager" className="absolute top-6 right-6 flex gap-2 z-10 font-sans">
            <div className="relative group">
                <button id="presets-dropdown-btn" className="btn-glass text-xs px-3 py-1">Load Preset ▼</button>
                <div id="presets-menu" className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-md hidden group-hover:block z-50 overflow-hidden">
                    {presets.length === 0 && <div className="p-2 text-xs text-white/50 text-center">No presets</div>}
                    {presets.map(p => (
                        <div
                            id={`preset-item-${p.id}`}
                            key={p.id}
                            onClick={() => onLoad(p)}
                            className="p-2 hover:bg-white/10 cursor-pointer text-sm flex justify-between items-center group/item"
                        >
                            <span className="truncate max-w-[120px]">{p.name}</span>
                            <span
                                id={`delete-preset-${p.id}`}
                                onClick={(e) => onDelete(p.name, e)}
                                className="text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-400 px-1 transition-opacity"
                            >
                                ×
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <button
                id="save-preset-btn"
                className="btn-glass text-xs px-3 py-1"
                onClick={onSaveToggle}
            >
                Save Preset
            </button>

            {/* Save Preset Dialog */}
            {showSaveDialog && (
                <div id="save-preset-dialog" className="absolute top-10 right-0 z-20 bg-black/90 border border-white/20 p-3 rounded-lg shadow-xl animate-fade-in flex gap-2 w-64">
                    <input
                        id="preset-name-input"
                        type="text"
                        className="input-glass text-xs py-1 h-8 flex-1"
                        placeholder="Preset Name"
                        value={presetName}
                        onChange={(e) => onPresetNameChange(e.target.value)}
                    />
                    <button id="confirm-save-preset" className="btn-primary text-xs px-3 h-8" onClick={onSaveConfirm}>Save</button>
                </div>
            )}
        </div>
    );
}
