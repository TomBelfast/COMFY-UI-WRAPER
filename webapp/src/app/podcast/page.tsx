"use client";

import { useState } from 'react';

export default function PodcastPage() {
    const [topic, setTopic] = useState("");
    const [style, setStyle] = useState("");
    const [duration, setDuration] = useState("5");
    const [voice, setVoice] = useState("default");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState("");

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);
        setGenerationStatus("Queuing...");

        // TODO: Podłączyć pod backend API podkastów
        setTimeout(() => {
            setGenerationStatus("Completed (demo)");
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in space-y-4">
            <div className="flex gap-4 h-[calc(100vh-100px)]">

                {/* Left Column (Builder) */}
                <div className="flex-1 max-w-xl min-w-[450px]">
                    <div className="glass-card card-3d-cinematic p-6 h-full flex flex-col relative overflow-hidden group">
                        <span className="text-label !tracking-widest !text-[9px] !text-emerald-500/70 mb-1">
                            Audio Gateway
                        </span>
                        <h2 className="text-title text-3xl tracking-tighter mb-6 relative">
                            <span className="relative z-10 italic pr-2">PODCAST STUDIO</span>
                        </h2>

                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="text-label block mb-2 font-bold tracking-[0.2em] text-[10px] text-white/50 group-focus-within:text-emerald-400 transition-colors">
                                    Temat / Prompt
                                </label>
                                <textarea
                                    className="input-glass h-32 resize-none w-full text-white/90 font-mono text-sm leading-relaxed"
                                    placeholder="Historia sztucznej inteligencji od Turinga do ChatGPT, w stylu dokumentu BBC..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    suppressHydrationWarning
                                />
                            </div>

                            <div>
                                <label className="text-label block mb-2 font-bold tracking-[0.2em] text-[10px] text-white/50 group-focus-within:text-emerald-400 transition-colors">
                                    Styl narracji
                                </label>
                                <input
                                    type="text"
                                    className="input-glass w-full text-white/90 font-mono text-sm"
                                    placeholder="np. dziennikarski, edukacyjny, komediowy..."
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    suppressHydrationWarning
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-label block mb-2 font-bold tracking-[0.2em] text-[10px] text-white/50">Czas (min)</label>
                                    <input
                                        type="number"
                                        className="input-glass w-full text-center font-mono text-sm"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        min={1}
                                        max={60}
                                        suppressHydrationWarning
                                    />
                                </div>
                                <div>
                                    <label className="text-label block mb-2 font-bold tracking-[0.2em] text-[10px] text-white/50">Głos</label>
                                    <select
                                        className="input-glass w-full font-mono text-sm"
                                        value={voice}
                                        onChange={(e) => setVoice(e.target.value)}
                                        suppressHydrationWarning
                                    >
                                        <option value="default">Domyślny</option>
                                        <option value="male_deep">Męski – głęboki</option>
                                        <option value="male_warm">Męski – ciepły</option>
                                        <option value="female_warm">Żeński – ciepły</option>
                                        <option value="female_pro">Żeński – profesjonalny</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                className={`w-full mt-6 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all relative overflow-hidden group/btn ${isGenerating
                                    ? "bg-emerald-500/10 border-emerald-500/50 cursor-not-allowed pointer-events-none"
                                    : "bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500 border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1"
                                    }`}
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                <span className={`text-[11px] font-black uppercase tracking-[0.4em] mb-1 z-10 ${isGenerating ? "text-emerald-400" : "text-emerald-400 group-hover/btn:text-white"}`}>
                                    {isGenerating ? "Processing" : "Initiate Podcast"}
                                </span>
                                <span className={`text-[8px] uppercase tracking-widest font-mono z-10 ${isGenerating ? "text-emerald-600" : "text-emerald-600 group-hover/btn:text-white/70"}`}>
                                    {isGenerating ? generationStatus : "Execute Audio Sequence"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column (Settings & History) */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="glass-card p-6 min-h-[150px]">
                        <span className="text-label !tracking-widest !text-[9px] !text-emerald-500/70 mb-1">
                            Podcast
                        </span>
                        <h3 className="text-title text-xl tracking-tighter mb-4">Ustawienia</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Zapis dźwięku</span>
                                <span className="text-xs font-mono font-bold text-emerald-400">MP3 / 320 kbps</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Silnik TTS</span>
                                <span className="text-xs font-mono font-bold text-emerald-400">OpenAI Voice</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Język bazowy</span>
                                <span className="text-xs font-mono font-bold text-emerald-400">Auto (PL)</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex-1 flex flex-col">
                        <span className="text-label !tracking-widest !text-[9px] !text-emerald-500/70 mb-1">
                            Your Creation
                        </span>
                        <h3 className="text-title text-xl tracking-tighter mb-4">Biblioteka Audio</h3>

                        <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-black/20">
                            <span className="text-2xl mb-2 opacity-30">🎙️</span>
                            <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Brak zdefiniowanych ścieżek</p>
                            <p className="text-white/20 text-[10px] uppercase tracking-widest mt-1">Stwórz swój pierwszy podkast</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
