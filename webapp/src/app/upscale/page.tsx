
"use client";

import WorkflowPage from "@/components/WorkflowPage";

export default function UpscalePage() {
    return (
        <WorkflowPage
            title="Z-Turbo Upscale"
            defaultModel="SDXL_Upscale_4x.safetensors"
            defaultSteps={20}
            defaultCfg={2.0}
            defaultSampler="euler"
            gatewayName="Upscale Node"
            workflowId="upscale"
        />
    );
}
