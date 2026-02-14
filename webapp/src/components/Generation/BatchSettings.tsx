
"use client";

interface BatchSettingsProps {
    batchSize: number;
    batchCount: number;
    onBatchSizeChange: (val: number) => void;
    onBatchCountChange: (val: number) => void;
}

export default function BatchSettings({ batchSize, batchCount, onBatchSizeChange, onBatchCountChange }: BatchSettingsProps) {
    return (
        <div id="batch-settings-container" className="grid grid-cols-2 gap-3 mt-4">
            <div id="batch-size-group">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Batch Size</span>
                    <span id="batch-size-value" className="text-xs font-medium text-emerald-400">{batchSize}</span>
                </div>
                <input
                    id="batch-size-slider"
                    type="range"
                    min="1"
                    max="4"
                    value={batchSize}
                    onChange={(e) => onBatchSizeChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                    suppressHydrationWarning
                />
            </div>
            <div id="batch-count-group">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Batch Count</span>
                    <span id="batch-count-value" className="text-xs font-medium text-emerald-400">{batchCount}</span>
                </div>
                <input
                    id="batch-count-slider"
                    type="range"
                    min="1"
                    max="10"
                    value={batchCount}
                    onChange={(e) => onBatchCountChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                    suppressHydrationWarning
                />
            </div>
        </div>
    );
}
