
"use client";

import WorkflowPage from "@/components/WorkflowPage";

export default function UpscalePage() {
    return (
        <WorkflowPage
            title="Z-Turbo Upscale"
            defaultModel="z-image-turbo-bf16-aio.safetensors"
            defaultSteps={8}
            defaultCfg={1.0}
            defaultSampler="res_multistep"
            gatewayName="Upscale Node"
            workflowId="upscale"
        />
    );
}
