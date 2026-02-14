
import { useState, useEffect } from "react";
import { fetchModels, fetchLoras } from "@/lib/api";

interface ModelSelectorProps {
    selectedModel: string;
    onModelSelect: (model: string) => void;
    selectedLoras: string[];
    onLoraToggle: (lora: string) => void;
}

export default function ModelSelector({
    selectedModel,
    onModelSelect,
    selectedLoras,
    onLoraToggle
}: ModelSelectorProps) {
    const [models, setModels] = useState<string[]>([]);
    const [loras, setLoras] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const modelList = await fetchModels();
                setModels(modelList);
                // Auto-select first model if none selected and available
                if (modelList.length > 0 && !selectedModel) {
                    onModelSelect(modelList[0]);
                }

                const loraList = await fetchLoras();
                setLoras(loraList);
            } catch (e) {
                console.error("Failed to load models/loras", e);
            }
        }
        loadData();
    }, []); // Run once on mount

    const filteredModels = models.filter(m =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Model Selection */}
            <div className="glass-card p-6 animate-fade-in-up stagger-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-label">Model</span>
                    <input
                        type="text"
                        placeholder="Search models..."
                        className="input-glass py-1 px-2 text-xs w-24 border-white/10 bg-white/5"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        suppressHydrationWarning
                    />
                </div>

                <h3 className="text-title text-xl mt-2 mb-4 truncate text-emerald-400" title={selectedModel}>
                    {selectedModel.replace(".safetensors", "")}
                </h3>

                <div className="mb-4">
                    <select
                        className="input-glass w-full text-sm"
                        value={selectedModel}
                        onChange={(e) => onModelSelect(e.target.value)}
                        suppressHydrationWarning
                    >
                        {filteredModels.length === 0 && <option disabled>No models match search</option>}
                        {filteredModels.map(m => (
                            <option key={m} value={m} className="text-black">{m}</option>
                        ))}
                    </select>
                </div>

                <p className="text-sm text-white/60 mb-4">
                    {filteredModels.length} / {models.length} available.
                </p>
                <div className="flex gap-2">
                    <button className="btn-glass w-full text-sm">Refine Config</button>
                </div>
            </div>

            {/* LoRA Selection */}
            <div className="glass-card p-6 animate-fade-in-up stagger-3">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-label">LoRA</span>
                    <span className="text-xs text-white/40">{selectedLoras.length} active</span>
                </div>

                {selectedLoras.length === 0 ? (
                    <p className="text-sm text-white/40 mb-4">No LoRAs selected</p>
                ) : (
                    <div className="space-y-2 mb-4">
                        {selectedLoras.map(lora => (
                            <div key={lora} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group">
                                <span className="text-sm truncate max-w-[150px]" title={lora}>
                                    {lora.replace(".safetensors", "")}
                                </span>
                                <button
                                    onClick={() => onLoraToggle(lora)}
                                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <select
                        className="btn-glass w-full text-sm text-center appearance-none"
                        onChange={(e) => {
                            if (e.target.value) {
                                onLoraToggle(e.target.value);
                            }
                        }}
                        value=""
                        suppressHydrationWarning
                    >
                        <option value="" disabled>+ Add LoRA</option>
                        {loras.map(l => (
                            <option key={l} value={l} className="text-black">{l}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
