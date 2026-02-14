
"use client";

interface ProgressPanelProps {
    status: string;
    currentBatch: number;
    totalBatch: number;
    progressValue: number;
    progressMax: number;
    baseSteps: number;
}

export default function ProgressPanel({ status, currentBatch, totalBatch, progressValue, progressMax, baseSteps }: ProgressPanelProps) {
    const batchPercent = Math.round((currentBatch / totalBatch) * 100);
    const stepMax = progressMax || baseSteps;
    const stepPercent = stepMax ? Math.round((progressValue / stepMax) * 100) : 0;

    return (
        <div id="generation-progress-panel" className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 animate-fade-in space-y-3">
            <div className="flex justify-between items-center text-xs text-white/70">
                <span id="generation-status-text">{status}</span>
            </div>

            {/* Batch Progress */}
            <div id="batch-progress-container">
                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                    <span>Image {currentBatch} / {totalBatch}</span>
                    <span>{batchPercent}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        id="batch-progress-bar"
                        className="h-full bg-emerald-500/50 transition-all duration-500"
                        style={{ width: `${batchPercent}%` }}
                    />
                </div>
            </div>

            {/* Step Progress */}
            <div id="step-progress-container">
                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                    <span>Steps {progressValue} / {stepMax}</span>
                    <span>{stepPercent}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        id="step-progress-bar"
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${stepPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
