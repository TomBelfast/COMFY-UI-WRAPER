
"use client";

import WorkflowPage from "@/components/WorkflowPage";

export default function FluxPage() {
    return (
        <WorkflowPage
            title="Flux Realism"
            defaultModel="flux1-dev.safetensors"
            defaultSteps={20}
            defaultCfg={3.5}
            defaultSampler="euler"
            gatewayName="High-Fidelity Node"
            workflowId="flux-realism"
        />
    );
}
