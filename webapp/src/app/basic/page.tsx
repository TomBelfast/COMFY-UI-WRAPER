
"use client";

import WorkflowPage from "@/components/WorkflowPage";

export default function BasicPage() {
    return (
        <WorkflowPage
            title="Standard Quality"
            defaultModel="v1-5-pruned-emaonly.ckpt"
            defaultSteps={20}
            defaultCfg={8.0}
            defaultSampler="euler"
            gatewayName="Legacy Node (SD 1.5)"
            workflowId="basic-txt2img"
        />
    );
}
