"use client";

import CharacterWizard from "../../components/CharacterCreator/CharacterWizard";

export default function CharacterPage() {
    return (
        <main className="h-screen max-h-screen bg-[#121212] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-emerald-500/5 blur-[100px] rounded-b-full pointer-events-none" />

            <div className="w-full max-w-7xl px-4 z-10 flex flex-col items-center">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
                        Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Character</span>
                    </h1>
                    <p className="text-white/40 tracking-widest text-xs uppercase font-bold">
                        Neural Identity Forge v1.0
                    </p>
                </div>

                <CharacterWizard />
            </div>
        </main>
    );
}
