"use client";

import CharacterWizard from "../../components/CharacterCreator/CharacterWizard";

export default function CharacterPage() {
    return (
        <main className="h-screen max-h-screen bg-[#121212] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-emerald-500/5 blur-[100px] rounded-b-full pointer-events-none" />

            <div className="w-full max-w-7xl px-4 z-10 flex flex-col items-center">
                <CharacterWizard />
            </div>
        </main>
    );
}
