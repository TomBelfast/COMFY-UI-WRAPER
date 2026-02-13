
"use client";

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import ModelSelector from "@/components/ModelSelector";
import Gallery from "@/components/Gallery";
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
  const [width, setWidth] = useState(1344);
  const [height, setHeight] = useState(768);
  const [selectedModel, setSelectedModel] = useState("Loading...");
  const [selectedLoras, setSelectedLoras] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");

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

  // Watch for completion to auto-save
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'status') {
      // Queue info
    } else if (lastMessage.type === 'executing' && lastMessage.data.node === null) {
      setIsGenerating(false);
      setGenerationStatus("Finished");
      // We could trigger a delay refresh here, but better is to catch 'executed' or manual check
    } else if (lastMessage.type === 'execution_success') {
      // This implies completion. However, status check endpoint gives us the filename.
      // Since the WS message might not have full filename info in standard format easily, 
      // we rely on check_status logic OR we assume the generate flow handles "status check".
    }
  }, [lastMessage]);

  // Enhanced Generation Flow with Auto-Save
  const handleGenerate = async () => {
    if (!positivePrompt) return;

    setIsGenerating(true);
    setGenerationStatus("Queuing...");

    try {
      const request: GenerationRequest = {
        positive_prompt: positivePrompt,
        negative_prompt: negativePrompt,
        width,
        height,
        model: selectedModel,
        lora_names: selectedLoras,
        steps: 20, // Default useful steps
        cfg: 7,
      };

      const res = await generateImage(request);

      if (res.status === 'queued') {
        setGenerationStatus(`Queued: ${res.prompt_id}`);

        // Start polling for status to get filename for gallery
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/comfy/status/${res.prompt_id}`);
            const statusData = await statusRes.json();

            if (statusData.status === 'completed' && statusData.filename) {
              clearInterval(pollInterval);
              setGenerationStatus("Completed");
              setIsGenerating(false);

              // Auto-Save to Gallery
              await saveToGallery({
                filename: statusData.filename,
                subfolder: statusData.subfolder || "", // Basic support for now
                prompt_positive: positivePrompt,
                prompt_negative: negativePrompt,
                model: selectedModel,
                width,
                height,
                steps: 20,
                cfg: 7
              });

              // Refresh Gallery
              setGalleryRefresh(prev => prev + 1);
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              setGenerationStatus("Failed");
              setIsGenerating(false);
            }
          } catch (e) {
            console.error("Poll error", e);
          }
        }, 1000);

      } else {
        setGenerationStatus("Failed to queue");
        setIsGenerating(false);
      }
    } catch (e) {
      console.error(e);
      setGenerationStatus("Error sending request");
      setIsGenerating(false);
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
        steps: 20,
        cfg: 7,
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
  };

  // Load from Gallery
  const handleLoadGalleryItem = (item: any) => {
    setPositivePrompt(item.prompt_positive);
    setNegativePrompt(item.prompt_negative);
    if (item.model) setSelectedModel(item.model);
    if (item.width) setWidth(item.width);
    if (item.height) setHeight(item.height);
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
          <div className="glass-card card-3d-cinematic p-6 animate-fade-in-up stagger-1 relative">

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label block mb-2">Width</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label className="text-label block mb-2">Height</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                className={`btn-primary w-full mt-4 ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? `Generating... (${generationStatus})` : '🎨 Generate Image'}
              </button>
            </div>
          </div>
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Steps</span>
                <span className="text-sm font-medium text-emerald-400">20</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">CFG Scale</span>
                <span className="text-sm font-medium text-emerald-400">7.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Sampler</span>
                <span className="text-sm font-medium text-emerald-400">DPM++ 2M SDE</span>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <Gallery refreshTrigger={galleryRefresh} onSelect={handleLoadGalleryItem} />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-white/30 text-xs">
        ComfyUI Wrapper v0.1.0 | Cinematic Matrix UI
      </footer>
    </div>
  );
}
