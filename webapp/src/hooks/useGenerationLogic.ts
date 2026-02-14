
"use client";

import { useState, useEffect } from 'react';
import {
    generateImage,
    GenerationRequest,
    fetchPresets,
    savePreset,
    deletePreset,
    GenerationPreset,
    useComfyWebSocket
} from "@/lib/api";

export function useGenerationLogic() {
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<string>("");

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

        if (lastMessage.type === 'execution_start') {
            setIsProcessing(true);
        }

        if (
            lastMessage.type === 'gallery_updated' ||
            lastMessage.type === 'executed' ||
            (lastMessage.type === 'executing' && lastMessage.data.node === null)
        ) {
            if (lastMessage.type === 'executed' || (lastMessage.type === 'executing' && lastMessage.data.node === null)) {
                setIsProcessing(false);
            }
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

                console.log("🚀 SENDING GENERATION REQUEST:", request);

                const res = await generateImage(request);

                if (res.status === 'queued') {
                    setGenerationStatus(`Generating Batch ${i + 1}/${batchCount}...`);
                    const result = await waitForCompletion(res.prompt_id);
                    if (result.status === 'success') {
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
            setIsProcessing(false);
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
        if (preset.model) setSelectedModel(preset.model);
        if (preset.loras) setSelectedLoras(preset.loras);
        if (preset.width) setWidth(preset.width);
        if (preset.height) setHeight(preset.height);
        if (preset.steps) setSteps(preset.steps);
        if (preset.cfg) setCfg(preset.cfg);
    };

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

    return {
        positivePrompt, setPositivePrompt,
        negativePrompt, setNegativePrompt,
        width, setWidth,
        height, setHeight,
        steps, setSteps,
        cfg, setCfg,
        sampler, setSampler,
        selectedModel, setSelectedModel,
        selectedLoras, setSelectedLoras,
        isGenerating, setIsGenerating,
        isProcessing, setIsProcessing,
        generationStatus, setGenerationStatus,
        batchSize, setBatchSize,
        batchCount, setBatchCount,
        currentBatchIndex, setCurrentBatchIndex,
        progress, setProgress,
        galleryRefresh, setGalleryRefresh,
        presets, setPresets,
        presetName, setPresetName,
        showSavePreset, setShowSavePreset,
        handleGenerate,
        handleSavePreset,
        handleLoadPreset,
        handleLoadGalleryItem,
        handleDeletePreset,
        handleLoraToggle
    };
}
