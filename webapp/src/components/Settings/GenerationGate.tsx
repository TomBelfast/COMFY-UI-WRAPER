
"use client";

import React from 'react';

interface GenerationGateProps {
    positivePrompt: string;
    setPositivePrompt: (val: string) => void;
    negativePrompt: string;
    setNegativePrompt: (val: string) => void;
    width: number;
    setWidth: (val: number) => void;
    height: number;
    setHeight: (val: number) => void;
    batchSize: number;
    setBatchSize: (val: number) => void;
    batchCount: number;
    setBatchCount: (val: number) => void;
    handleGenerate: () => void;
    isGenerating: boolean;
    isProcessing: boolean;
    generationStatus: string;
    currentBatchIndex: number;
    progress: { value: number; max: number };
    presets: any[];
    handleLoadPreset: (p: any) => void;
    handleDeletePreset: (name: string, e: React.MouseEvent) => void;
    setShowSavePreset: (val: boolean) => void;
    showSavePreset: boolean;
    presetName: string;
    setPresetName: (val: string) => void;
    handleSavePreset: () => void;
    title: string;
    gatewayName: string;
}

export default function GenerationGate({
    positivePrompt, setPositivePrompt,
    negativePrompt, setNegativePrompt,
    width, setWidth,
    height, setHeight,
    batchSize, setBatchSize,
    batchCount, setBatchCount,
    handleGenerate,
    isGenerating,
    isProcessing,
    generationStatus,
    currentBatchIndex,
    progress,
    presets,
    handleLoadPreset,
    handleDeletePreset,
    setShowSavePreset,
    showSavePreset,
    presetName,
    setPresetName,
    handleSavePreset,
    title,
    gatewayName
}: GenerationGateProps) {
    return (
        <div className={`glass-card card-3d-cinematic p-6 animate-fade-in-up stagger-1 relative ${isProcessing ? 'snake-active' : ''}`}>

            {/* Action Bar */}
            <div className="absolute top-6 right-6 flex gap-2 z-10">
                <div className="relative group">
                    <button className="btn-glass text-xs px-3 py-1 border-emerald-500/20">Presets ▼</button>
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-md hidden group-hover:block z-50 overflow-hidden">
                        {presets.length === 0 && <div className="p-4 text-xs text-white/30 text-center italic">No presets saved</div>}
                        {presets.map(p => (
                            <div
                                key={p.id}
                                onClick={() => handleLoadPreset(p)}
                                className="p-3 hover:bg-emerald-500/10 cursor-pointer text-sm flex justify-between items-center group/item transition-colors border-b border-white/5 last:border-0"
                            >
                                <span className="truncate max-w-[120px] text-white/80">{p.name}</span>
                                <span
                                    onClick={(e) => handleDeletePreset(p.name, e)}
                                    className="text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-400 px-2 font-bold"
                                >
                                    ×
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    className="btn-glass text-xs px-3 py-1 border-white/10"
                    onClick={() => setShowSavePreset(!showSavePreset)}
                >
                    Save Current
                </button>
            </div>

            {/* Save Preset Dialog */}
            {showSavePreset && (
                <div className="absolute top-16 right-6 z-20 bg-matrix-dark/95 border border-emerald-500/30 p-4 rounded-xl shadow-2xl animate-fade-in flex flex-col gap-3 backdrop-blur-xl">
                    <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">Snapshot Config</span>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input-glass text-xs py-1 h-10 w-40"
                            placeholder="Signature Name..."
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                        />
                        <button className="btn-primary text-xs px-4 h-10" onClick={handleSavePreset}>Store</button>
                    </div>
                </div>
            )}

            <span className="text-label">{gatewayName}</span>
            <h2 className="text-title text-3xl mt-2 mb-6">{title}</h2>

            <div className="space-y-4">
                <div>
                    <label className="text-label block mb-2">Neural Input (Positive)</label>
                    <textarea
                        className="input-glass h-32 resize-none w-full focus:border-emerald-500/50 transition-all"
                        placeholder="Describe your vision..."
                        value={positivePrompt}
                        onChange={(e) => setPositivePrompt(e.target.value)}
                        suppressHydrationWarning
                        id="positive-prompt"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-label block mb-2">Neural Filter (Negative)</label>
                        <input
                            id="negative-prompt"
                            type="text"
                            className="input-glass w-full"
                            placeholder="Artifacts, low quality..."
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-label block mb-2">Resolution</label>
                        <div className="flex gap-2">
                            <button onClick={() => { setWidth(1088); setHeight(1920); }} className={`flex-1 py-2 rounded-lg border text-[10px] font-bold ${width === 1088 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5'}`}>9:16</button>
                            <button onClick={() => { setWidth(1280); setHeight(1280); }} className={`flex-1 py-2 rounded-lg border text-[10px] font-bold ${width === 1280 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5'}`}>1:1</button>
                            <button onClick={() => { setWidth(1920); setHeight(1088); }} className={`flex-1 py-2 rounded-lg border text-[10px] font-bold ${width === 1920 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5'}`}>16:9</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-1 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Multi-Cast (Size)</span>
                            <span className="text-xs font-bold text-emerald-400">{batchSize}</span>
                        </div>
                        <input
                            id="batch-size-slider"
                            type="range" min="1" max="4" value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Iterations (Count)</span>
                            <span className="text-xs font-bold text-emerald-400">{batchCount}</span>
                        </div>
                        <input
                            id="batch-count-slider"
                            type="range" min="1" max="10" value={batchCount}
                            onChange={(e) => setBatchCount(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>
                </div>

                <button
                    id="generate-button"
                    className={`btn-primary w-full mt-2 py-6 text-lg tracking-[0.3em] font-black ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow hover:scale-[1.01] active:scale-[0.99] transition-all'}`}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'SEQUENCING...' : 'INITIATE GENERATION'}
                </button>

                {isGenerating && (
                    <div className="mt-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 animate-fade-in space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest animate-pulse">{generationStatus}</span>
                        </div>

                        <div>
                            <div className="flex justify-between text-[9px] text-white/40 mb-1 font-mono uppercase">
                                <span>Batch Sync</span>
                                <span>{currentBatchIndex} / {batchCount}</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500/30 transition-all duration-700" style={{ width: `${(currentBatchIndex / batchCount) * 100}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[9px] text-white/40 mb-1 font-mono uppercase">
                                <span>Neural Integration</span>
                                <span>{progress.max ? Math.round((progress.value / progress.max) * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300" style={{ width: `${progress.max ? (progress.value / progress.max) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
