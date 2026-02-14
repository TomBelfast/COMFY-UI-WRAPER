
"use client";

interface QuickSettingsProps {
    steps: number;
    cfg: number;
    sampler: string;
    onStepsChange: (v: number) => void;
    onCfgChange: (v: number) => void;
    onSamplerChange: (v: string) => void;
}

export default function QuickSettings({ steps, cfg, sampler, onStepsChange, onCfgChange, onSamplerChange }: QuickSettingsProps) {
    const samplers = [
        "res_multistep", "euler", "euler_ancestral", "heun", "heunpp2", "dpm_2",
        "dpm_2_ancestral", "lms", "dpm_fast", "dpm_adaptive", "dpmpp_2s_ancestral",
        "dpmpp_sde", "dpmpp_sde_gpu", "dpmpp_2m", "dpmpp_2m_sde", "dpmpp_2m_sde_gpu",
        "dpmpp_3m_sde", "dpmpp_3m_sde_gpu", "ddpm", "lcm", "ddim", "uni_pc", "uni_pc_bh2"
    ];

    return (
        <div id="quick-settings" className="glass-card p-6 animate-fade-in-up stagger-4">
            <span className="text-label">Generation</span>
            <h3 className="text-title text-xl mt-2 mb-4">Settings</h3>
            <div className="space-y-3">
                {/* Steps Slider */}
                <div id="steps-setting">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70">Steps</span>
                        <span id="steps-value" className="text-sm font-medium text-emerald-400">{steps}</span>
                    </div>
                    <input
                        id="steps-slider"
                        type="range"
                        min="1"
                        max="50"
                        value={steps}
                        onChange={(e) => onStepsChange(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                        suppressHydrationWarning
                    />
                </div>

                {/* CFG Slider */}
                <div id="cfg-setting">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70">CFG Scale</span>
                        <span id="cfg-value" className="text-sm font-medium text-emerald-400">{cfg}</span>
                    </div>
                    <input
                        id="cfg-slider"
                        type="range"
                        min="0"
                        max="20"
                        step="0.1"
                        value={cfg}
                        onChange={(e) => onCfgChange(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                        suppressHydrationWarning
                    />
                </div>

                <div id="sampler-setting">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70">Sampler</span>
                    </div>
                    <select
                        id="sampler-select"
                        value={sampler}
                        onChange={(e) => onSamplerChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-emerald-400 focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer"
                        suppressHydrationWarning
                    >
                        {samplers.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
}
