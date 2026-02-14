
"use client";

import WorkflowPage from "@/components/WorkflowPage";

export default function Home() {
  return (
    <WorkflowPage
      title="Z-Turbo Generation"
      defaultModel="z-image-turbo-bf16-aio.safetensors"
      defaultSteps={8}
      defaultCfg={1.0}
      defaultSampler="res_multistep"
      gatewayName="Primary Gateway"
      workflowId="turbo-gen"
    />
  );
}
