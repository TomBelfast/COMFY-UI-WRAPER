
"use client";

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import ModelSelector from "@/components/ModelSelector";
import Gallery from "@/components/Gallery";
import LogViewer from "@/components/LogViewer";
import {
  generateImage,
  GenerationRequest,
  fetchPresets,
  savePreset,
  deletePreset,
  saveToGallery,
  GenerationPreset,
  useComfyWebSocket
} from "@/lib/api";

export default function Home() {
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(1088);
  const [height, setHeight] = useState(1920);
  const [steps, setSteps] = useState(8);
  const [cfg, setCfg] = useState(1.0);
  const [sampler, setSampler] = useState("res_multistep");
  const [selectedModel, setSelectedModel] = useState("Loading...");
  const [selectedLoras, setSelectedLoras] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");

  // Batch State
  const [batchSize, setBatchSize] = useState(1);
  const [batchCount, setBatchCount] = useState(1);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [progress, setProgress] = useState({ value: 0, max: 0 });

  // Gallery Refresh State
  const [galleryRefresh, setGalleryRefresh] = useState(0);

  // Presets State
  const [presets, setPresets] = useState<GenerationPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    const loaded = await fetchPresets();
    setPresets(loaded);
  };

  // WebSocket Logic for Status & Auto-Save
  const { lastMessage } = useComfyWebSocket();

  // Watch for progress and execution events
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'progress') {
      setProgress({ value: lastMessage.data.value, max: lastMessage.data.max });
    }

    // Refresh Gallery on any completion event from WebSocket
    if (lastMessage.type === 'executed' || (lastMessage.type === 'executing' && lastMessage.data.node === null)) {
      setGalleryRefresh(prev => prev + 1);
    }
  }, [lastMessage]);

  const waitForCompletion = async (promptId: string): Promise<any> => {
    return new Promise((resolve) => {
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/comfy/status/${promptId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'completed' && (statusData.filename || statusData.filenames)) {
            clearInterval(pollInterval);
            resolve({ status: 'success', data: statusData });
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            resolve({ status: 'failed', error: 'Generation failed' });
          }
        } catch (e) {
          console.error("Poll error", e);
        }
      }, 1000);
    });
  };

  // Enhanced Generation Flow with Batch Support
  const handleGenerate = async () => {
    if (!positivePrompt) return;

    setIsGenerating(true);
    setCurrentBatchIndex(0);
    setProgress({ value: 0, max: 0 });

    try {
      for (let i = 0; i < batchCount; i++) {
        setCurrentBatchIndex(i + 1);
        setGenerationStatus(`Queuing Batch ${i + 1}/${batchCount}...`);

        const request: GenerationRequest = {
          positive_prompt: positivePrompt,
          negative_prompt: negativePrompt,
          width,
          height,
          model: selectedModel,
          lora_names: selectedLoras,
          steps,
          cfg,
          sampler_name: sampler,
          batch_size: batchSize,
        };

        const res = await generateImage(request);

        if (res.status === 'queued') {
          setGenerationStatus(`Generating Batch ${i + 1}/${batchCount}...`);

          // Wait for completion
          const result = await waitForCompletion(res.prompt_id);

          if (result.status === 'success') {
            // Auto-Save to Gallery (Handle Batch)
            const filesToSave = result.data.filenames && result.data.filenames.length > 0
              ? result.data.filenames
              : [result.data.filename];

            for (const fname of filesToSave) {
              await saveToGallery({
                filename: fname,
                subfolder: result.data.subfolder || "",
                prompt_positive: positivePrompt,
                prompt_negative: negativePrompt,
                model: selectedModel,
                width,
                height,
                steps,
                cfg,
              });
            }

            // Refresh Gallery
            setGalleryRefresh(prev => prev + 1);
          } else {
            setGenerationStatus(`Batch ${i + 1} Failed`);
          }
        } else {
          setGenerationStatus("Failed to queue");
        }
      }
      setGenerationStatus("Finished");
    } catch (e) {
      console.error(e);
      setGenerationStatus("Error sending request");
    } finally {
      setIsGenerating(false);
      setProgress({ value: 0, max: 0 });
    }
  };

  const handleSavePreset = async () => {
    if (!presetName) return;
    try {
      await savePreset({
        name: presetName,
        prompt_positive: positivePrompt,
        prompt_negative: negativePrompt,
        model: selectedModel,
        loras: selectedLoras,
        width,
        height,
        steps,
        cfg,
      });
      setShowSavePreset(false);
      setPresetName("");
      loadPresets();
    } catch (e) {
      console.error("Failed to save preset", e);
    }
  };

  const handleLoadPreset = (preset: GenerationPreset) => {
    setPositivePrompt(preset.prompt_positive);
    setNegativePrompt(preset.prompt_negative);
    // Ensure model exists in list? For now just set it and hope
    if (preset.model) setSelectedModel(preset.model);
    if (preset.loras) setSelectedLoras(preset.loras);
    if (preset.width) setWidth(preset.width);
    if (preset.height) setHeight(preset.height);
    if (preset.steps) setSteps(preset.steps);
    if (preset.cfg) setCfg(preset.cfg);
  };

  // Load from Gallery
  const handleLoadGalleryItem = (item: any) => {
    setPositivePrompt(item.prompt_positive);
    setNegativePrompt(item.prompt_negative);
    if (item.model) setSelectedModel(item.model);
    if (item.width) setWidth(item.width);
    if (item.height) setHeight(item.height);
    if (item.steps) setSteps(item.steps);
    if (item.cfg) setCfg(item.cfg);
  };

  const handleDeletePreset = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete preset "${name}"?`)) {
      await deletePreset(name);
      loadPresets();
    }
  };

  const handleLoraToggle = (lora: string) => {
    setSelectedLoras(prev =>
      prev.includes(lora)
        ? prev.filter(l => l !== lora)
        : [...prev, lora]
    );
  };

  return (
    <div className="min-h-screen bg-matrix flex flex-col">
      {/* Header with Connection Status */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Prompt Builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`glass-card card-3d-cinematic p-6 animate-fade-in-up stagger-1 relative ${isGenerating ? 'snake-active' : ''}`}>

            {/* Action Bar */}
            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <div className="relative group">
                <button className="btn-glass text-xs px-3 py-1">Load Preset ▼</button>
                <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-md hidden group-hover:block z-50">
                  {presets.length === 0 && <div className="p-2 text-xs text-white/50 text-center">No presets</div>}
                  {presets.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleLoadPreset(p)}
                      className="p-2 hover:bg-white/10 cursor-pointer text-sm flex justify-between items-center group/item"
                    >
                      <span className="truncate max-w-[120px]">{p.name}</span>
                      <span
                        onClick={(e) => handleDeletePreset(p.name, e)}
                        className="text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-400 px-1"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="btn-glass text-xs px-3 py-1"
                onClick={() => setShowSavePreset(!showSavePreset)}
              >
                Save Preset
              </button>
            </div>

            {/* Save Preset Dialog */}
            {showSavePreset && (
              <div className="absolute top-16 right-6 z-20 bg-black/90 border border-white/20 p-3 rounded-lg shadow-xl animate-fade-in flex gap-2">
                <input
                  type="text"
                  className="input-glass text-xs py-1 h-8 w-32"
                  placeholder="Preset Name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
                <button className="btn-primary text-xs px-3 h-8" onClick={handleSavePreset}>Save</button>
              </div>
            )}

            <span className="text-label">Prompt Builder</span>
            <h2 className="text-title text-3xl mt-2 mb-6">Create Your Vision</h2>

            <div className="space-y-4">
              <div>
                <label className="text-label block mb-2">Positive Prompt</label>
                <textarea
                  className="input-glass h-32 resize-none w-full"
                  placeholder="A beautiful oil painting of a sunset over mountains, vibrant colors, thick impasto brush strokes..."
                  value={positivePrompt}
                  onChange={(e) => setPositivePrompt(e.target.value)}
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="text-label block mb-2">Negative Prompt</label>
                <input
                  type="text"
                  className="input-glass w-full"
                  placeholder="blurry, low quality, text, watermark"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="text-label block mb-2">Aspect Ratio</label>
                <div className="flex gap-3 items-end">
                  {/* 9:16 Portrait */}
                  <button
                    type="button"
                    onClick={() => { setWidth(1088); setHeight(1920); }}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${width === 1088 && height === 1920 ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                  >
                    <div className={`w-5 h-8 rounded-sm border-2 ${width === 1088 && height === 1920 ? 'border-emerald-400' : 'border-white/40'}`} />
                    <span className={`text-[10px] font-mono ${width === 1088 && height === 1920 ? 'text-emerald-400' : 'text-white/50'}`}>9:16</span>
                  </button>

                  {/* 1:1 Square */}
                  <button
                    type="button"
                    onClick={() => { setWidth(1280); setHeight(1280); }}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${width === 1280 && height === 1280 ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                  >
                    <div className={`w-7 h-7 rounded-sm border-2 ${width === 1280 && height === 1280 ? 'border-emerald-400' : 'border-white/40'}`} />
                    <span className={`text-[10px] font-mono ${width === 1280 && height === 1280 ? 'text-emerald-400' : 'text-white/50'}`}>1:1</span>
                  </button>

                  {/* 16:9 Landscape */}
                  <button
                    type="button"
                    onClick={() => { setWidth(1920); setHeight(1088); }}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${width === 1920 && height === 1088 ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                  >
                    <div className={`w-8 h-5 rounded-sm border-2 ${width === 1920 && height === 1088 ? 'border-emerald-400' : 'border-white/40'}`} />
                    <span className={`text-[10px] font-mono ${width === 1920 && height === 1088 ? 'text-emerald-400' : 'text-white/50'}`}>16:9</span>
                  </button>

                  <span className="text-[10px] text-white/30 ml-auto font-mono self-center">{width}×{height}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Batch Size</span>
                    <span className="text-xs font-medium text-emerald-400">{batchSize}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Batch Count</span>
                    <span className="text-xs font-medium text-emerald-400">{batchCount}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                  />
                </div>
              </div>

              <button
                className={`btn-primary w-full mt-4 ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Computing...' : '🎨 Generate Image'}
              </button>

              {isGenerating && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 animate-fade-in space-y-3">
                  <div className="flex justify-between items-center text-xs text-white/70">
                    <span>{generationStatus}</span>
                  </div>

                  {/* Batch Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] text-white/50 mb-1">
                      <span>Image {currentBatchIndex} / {batchCount}</span>
                      <span>{Math.round((currentBatchIndex / batchCount) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/50 transition-all duration-500"
                        style={{ width: `${(currentBatchIndex / batchCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Step Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] text-white/50 mb-1">
                      <span>Steps {progress.value} / {progress.max || steps}</span>
                      <span>{progress.max ? Math.round((progress.value / progress.max) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${progress.max ? (progress.value / progress.max) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gallery - Moved here */}
          <Gallery refreshTrigger={galleryRefresh} onSelect={handleLoadGalleryItem} />
        </div>

        {/* Side Panel - Model Selection & Gallery */}
        <div className="space-y-4">
          <ModelSelector
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            selectedLoras={selectedLoras}
            onLoraToggle={handleLoraToggle}
          />

          {/* Quick Settings */}
          <div className="glass-card p-6 animate-fade-in-up stagger-4">
            <span className="text-label">Generation</span>
            <h3 className="text-title text-xl mt-2 mb-4">Settings</h3>
            <div className="space-y-3">
              {/* Steps Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">Steps</span>
                  <span className="text-sm font-medium text-emerald-400">{steps}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                />
              </div>

              {/* CFG Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">CFG Scale</span>
                  <span className="text-sm font-medium text-emerald-400">{cfg}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={cfg}
                  onChange={(e) => setCfg(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">Sampler</span>
                </div>
                <select
                  value={sampler}
                  onChange={(e) => setSampler(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-emerald-400 focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="res_multistep">res_multistep</option>
                  <option value="euler">euler</option>
                  <option value="euler_ancestral">euler_ancestral</option>
                  <option value="heun">heun</option>
                  <option value="heunpp2">heunpp2</option>
                  <option value="dpm_2">dpm_2</option>
                  <option value="dpm_2_ancestral">dpm_2_ancestral</option>
                  <option value="lms">lms</option>
                  <option value="dpm_fast">dpm_fast</option>
                  <option value="dpm_adaptive">dpm_adaptive</option>
                  <option value="dpmpp_2s_ancestral">dpmpp_2s_ancestral</option>
                  <option value="dpmpp_sde">dpmpp_sde</option>
                  <option value="dpmpp_sde_gpu">dpmpp_sde_gpu</option>
                  <option value="dpmpp_2m">dpmpp_2m</option>
                  <option value="dpmpp_2m_sde">dpmpp_2m_sde</option>
                  <option value="dpmpp_2m_sde_gpu">dpmpp_2m_sde_gpu</option>
                  <option value="dpmpp_3m_sde">dpmpp_3m_sde</option>
                  <option value="dpmpp_3m_sde_gpu">dpmpp_3m_sde_gpu</option>
                  <option value="ddpm">ddpm</option>
                  <option value="lcm">lcm</option>
                  <option value="ddim">ddim</option>
                  <option value="uni_pc">uni_pc</option>
                  <option value="uni_pc_bh2">uni_pc_bh2</option>
                </select>
              </div>
            </div>
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-white/30 text-xs">
        ComfyUI Wrapper v0.1.0 | Cinematic Matrix UI
      </footer>
      {/* Log Stream */}
      <LogViewer />
    </div>
  );
}
