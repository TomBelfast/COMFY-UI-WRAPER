
"use client";

import Header from "@/components/Header";
import Gallery from "@/components/Gallery";
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
}

export default function WorkflowPage({
    title,
    defaultModel,
    defaultSteps,
    defaultCfg,
    defaultSampler,
    gatewayName
}: WorkflowPageProps) {
    const logic = useGenerationLogic();

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

                {/* RIGHT COMPONENT: Gallery (Atomic Isolation) */}
                <div className="col-span-12 lg:col-span-7">
                    <Gallery
                        refreshTrigger={logic.galleryRefresh}
                        onSelect={logic.handleLoadGalleryItem}
                    />
                </div>

            </main>

            <footer className="p-6 text-center text-white/10 text-[9px] uppercase tracking-[0.5em] font-black">
                Terminal Protocol v2.4.0 // Connection Established
            </footer>
            <LogViewer />
        </div>
    );
}
