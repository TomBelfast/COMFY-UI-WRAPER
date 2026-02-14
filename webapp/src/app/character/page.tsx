"use client";

import CharacterWizard from "../../components/CharacterCreator/CharacterWizard";
import Link from "next/link";

export default function CharacterPage() {
    return (
        <main className="h-screen max-h-screen bg-[#121212] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Home button */}
            <Link
                href="/"
                className="absolute top-8 left-8 z-50 flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-full text-white/40 hover:text-emerald-400 transition-all backdrop-blur-md group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Home</span>
            </Link>

            <div className="absolute top-0 left-0 w-full h-96 bg-emerald-500/5 blur-[100px] rounded-b-full pointer-events-none" />

            <div className="w-full max-w-7xl px-4 z-10 flex flex-col items-center">
                <CharacterWizard />
            </div>
        </main>
    );
}
