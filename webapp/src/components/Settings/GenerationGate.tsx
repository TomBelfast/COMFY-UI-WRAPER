
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
    elapsedTime: number;
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
    elapsedTime,
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
                            suppressHydrationWarning
                        />
                    </div>
                    <div>
                        <label className="text-label block mb-2">Aspect Ratio</label>
                        <div className="flex gap-1">
                            <button
                                onClick={() => { setWidth(1088); setHeight(1920); }}
                                className={`flex-1 flex flex-col items-center gap-2 py-2 transition-all group ${width === 1088 ? 'text-emerald-400' : 'text-white/60 hover:text-white/90'}`}
                            >
                                <div className={`w-3.5 h-6 rounded-[1px] border-2 transition-all ${width === 1088 ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-emerald-500/30' : 'border-white/50'}`} />
                                <span className={`text-[10px] font-black tracking-[0.2em] transition-all ${width === 1088 ? 'opacity-100' : 'opacity-80'}`}>9:16</span>
                            </button>
                            <button
                                onClick={() => { setWidth(1280); setHeight(1280); }}
                                className={`flex-1 flex flex-col items-center gap-2 py-2 transition-all group ${width === 1280 ? 'text-emerald-400' : 'text-white/60 hover:text-white/90'}`}
                            >
                                <div className={`w-5 h-5 rounded-[1px] border-2 transition-all ${width === 1280 ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-emerald-500/30' : 'border-white/50'}`} />
                                <span className={`text-[10px] font-black tracking-[0.2em] transition-all ${width === 1280 ? 'opacity-100' : 'opacity-80'}`}>1:1</span>
                            </button>
                            <button
                                onClick={() => { setWidth(1920); setHeight(1088); }}
                                className={`flex-1 flex flex-col items-center gap-2 py-2 transition-all group ${width === 1920 ? 'text-emerald-400' : 'text-white/60 hover:text-white/90'}`}
                            >
                                <div className={`w-6 h-3.5 mt-1 rounded-[1px] border-2 transition-all ${width === 1920 ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-emerald-500/30' : 'border-white/50'}`} />
                                <span className={`text-[10px] font-black tracking-[0.2em] transition-all ${width === 1920 ? 'opacity-100' : 'opacity-80'}`}>16:9</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-1 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-label !tracking-normal">Batch Size</span>
                            <span className="text-xs font-bold text-emerald-400">{batchSize}</span>
                        </div>
                        <input
                            id="batch-size-slider"
                            type="range" min="1" max="4" value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            suppressHydrationWarning
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-label !tracking-normal">Iterations (Count)</span>
                            <span className="text-xs font-bold text-emerald-400">{batchCount}</span>
                        </div>
                        <input
                            id="batch-count-slider"
                            type="range" min="1" max="10" value={batchCount}
                            onChange={(e) => setBatchCount(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                <button
                    id="generate-button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-6 mt-2 relative group overflow-hidden rounded-xl transition-all duration-500 transform-gpu ${isGenerating
                        ? 'bg-white/5 border border-white/10 cursor-not-allowed scale-[0.98]'
                        : 'bg-emerald-500 border-2 border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.3),0_15px_45px_rgba(0,0,0,0.5)] hover:shadow-[0_0_60px_#10b981,0_20px_60px_rgba(0,0,0,0.7)] hover:-translate-y-1 active:translate-y-0.5'
                        }`}
                >
                    {/* Inner Gloss / Reflection */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent z-0 pointer-events-none" />

                    {isGenerating ? (
                        <div className="relative flex items-center justify-center gap-5 z-10">
                            <div className="relative w-6 h-6">
                                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
                                <div className="absolute inset-0 border-2 border-t-emerald-500 rounded-full animate-spin" />
                            </div>
                            <div className="flex flex-col items-start text-left leading-none">
                                <span className="text-[14px] uppercase tracking-[0.4em] font-black text-emerald-400 animate-pulse">Sequencing Node</span>
                                <span className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-mono mt-1.5 ml-0.5">Neural Pattern Integration</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Luxury Shine Sweep */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-0" />

                            {/* Neon Glow under text */}
                            <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-30 blur-[40px] transition-opacity duration-300 z-0" />

                            <div className="relative flex items-center justify-center gap-4 z-10">
                                <div className="p-1.5 px-2 bg-black/30 rounded-lg border border-black/10 transition-transform group-hover:scale-110 shadow-inner">
                                    <svg className="w-5 h-5 text-black group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-start text-left leading-none">
                                    <span className="text-[14px] uppercase tracking-[0.5em] font-black text-black group-hover:text-white transition-colors duration-300">
                                        Initiate Generation
                                    </span>
                                    <span className="text-[8px] uppercase tracking-[0.3em] text-black/50 group-hover:text-white/40 font-mono mt-1.5 ml-0.5">
                                        Execute Primary Neural Sequence
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
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
                                <div className="flex gap-4">
                                    <span>Neural Integration</span>
                                    <span className="text-emerald-500 font-bold">[{progress.value} / {progress.max}]</span>
                                </div>
                                <div className="flex gap-4">
                                    <span>Time: {elapsedTime}s</span>
                                    <span>{progress.max ? Math.round((progress.value / progress.max) * 100) : 0}%</span>
                                </div>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-300 relative" style={{ width: `${progress.max ? (progress.value / progress.max) * 100 : 0}%` }}>
                                    <div className="absolute top-0 right-0 w-4 h-full bg-white/40 blur-[2px] animate-pulse" />
                                </div>
                            </div>
                            <div className="mt-2 text-[8px] font-mono text-emerald-500/50 uppercase tracking-tighter overflow-hidden whitespace-nowrap">
                                {`>>> PROCESSING NEURAL TENSORS | SEED_OP:${Math.round(Math.random() * 999999)} | STREAM_ACTIVE | BUFFER_SYNC...`.repeat(2)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
