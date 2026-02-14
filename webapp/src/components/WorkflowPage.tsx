
"use client";

import Header from "@/components/Header";
import GalleryView from "@/components/GalleryView";
import LogViewer from "@/components/LogViewer";
import GenerationGate from "@/components/Settings/GenerationGate";
import ParameterPanel from "@/components/Settings/ParameterPanel";
import { useGenerationLogic } from "@/hooks/useGenerationLogic";
import { useEffect } from "react";

interface WorkflowPageProps {
    title: string;
    defaultModel: string;
    defaultSteps: number;
    defaultCfg: number;
    defaultSampler: string;
    gatewayName: string;
    workflowId: string;
}

export default function WorkflowPage({
    title,
    defaultModel,
    defaultSteps,
    defaultCfg,
    defaultSampler,
    gatewayName,
    workflowId
}: WorkflowPageProps) {
    const logic = useGenerationLogic(workflowId);

    useEffect(() => {
        logic.setSelectedModel(defaultModel);
        logic.setSteps(defaultSteps);
        logic.setCfg(defaultCfg);
        logic.setSampler(defaultSampler);
    }, [defaultModel, defaultSteps, defaultCfg, defaultSampler]);

    return (
        <div className="min-h-screen bg-matrix flex flex-col" suppressHydrationWarning>
            <Header />

            <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COMPONENT: Controls & Settings (Atomic Isolation) */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                    <GenerationGate
                        {...logic}
                        title={title}
                        gatewayName={gatewayName}
                    />
                    <ParameterPanel
                        steps={logic.steps}
                        setSteps={logic.setSteps}
                        cfg={logic.cfg}
                        setCfg={logic.setCfg}
                        sampler={logic.sampler}
                        setSampler={logic.setSampler}
                        title={title}
                        selectedModel={logic.selectedModel}
                    />
                </div>

                {/* RIGHT COMPONENT: GalleryView (Atomic Isolation) */}
                <div className="col-span-12 lg:col-span-7">
                    <GalleryView
                        refreshTrigger={logic.galleryRefresh}
                        onSelect={logic.handleLoadGalleryItem}
                        positivePrompt={logic.positivePrompt}
                        setPositivePrompt={logic.setPositivePrompt}
                        negativePrompt={logic.negativePrompt}
                        setNegativePrompt={logic.setNegativePrompt}
                        handleGenerate={logic.handleGenerate}
                        isGenerating={logic.isGenerating}
                        progress={logic.progress}
                        workflowId={workflowId}
                    />
                </div>

            </main>

            <footer className="p-6 text-center text-white/30 text-[9px] uppercase tracking-[0.5em] font-black">
                Terminal Protocol v2.4.0 // Connection Established
            </footer>
            <LogViewer />
        </div>
    );
}
