
"use client";

import React from 'react';

interface ParameterPanelProps {
    steps: number;
    setSteps: (val: number) => void;
    cfg: number;
    setCfg: (val: number) => void;
    sampler: string;
    setSampler: (val: string) => void;
    title: string;
    selectedModel: string;
}

const CONSTANT_SAMPLERS = [
    "res_multistep",
    "euler",
    "euler_ancestral",
    "dpmpp_2m",
    "dpmpp_2m_sde",
    "dpmpp_sde",
    "uni_pc"
];

export default function ParameterPanel({
    steps, setSteps,
    cfg, setCfg,
    sampler, setSampler,
    title,
    selectedModel
}: ParameterPanelProps) {
    return (
        <div className="glass-card p-6 border-white/5 animate-fade-in-up stagger-2">
            <span className="text-label border-b border-white/5 pb-2 !tracking-widest">Core Parameters</span>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-label !tracking-normal">Steps</span>
                        <span className="text-xs font-bold text-emerald-500">{steps}</span>
                    </div>
                    <input
                        id="param-steps-slider"
                        type="range" min="1" max="50" value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-label !tracking-normal">CFG Force</span>
                        <span className="text-xs font-bold text-emerald-500">{cfg}</span>
                    </div>
                    <input
                        id="param-cfg-slider"
                        type="range" min="0" max="20" step="0.1" value={cfg}
                        onChange={(e) => setCfg(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-label !tracking-normal">Sampler Engine</span>
                    </div>
                    <select
                        id="param-sampler-select"
                        value={sampler}
                        onChange={(e) => setSampler(e.target.value)}
                        className="input-glass w-full text-xs font-mono py-2 cursor-pointer [color-scheme:dark]"
                    >
                        {CONSTANT_SAMPLERS.map(s => (
                            <option key={s} value={s} className="bg-[#0a0a0a] text-white">
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <div className="flex flex-col gap-1">
                        <span className="text-label !tracking-normal mb-1">Checkpoint Module</span>
                        <span className="text-[10px] text-emerald-400 font-mono break-all leading-relaxed">
                            {selectedModel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
