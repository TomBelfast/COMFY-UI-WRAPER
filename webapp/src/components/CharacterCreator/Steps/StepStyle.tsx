"use client";

interface StepStyleProps {
    value?: 'realistic' | 'anime';
    onChange: (val: 'realistic' | 'anime') => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepStyle({ value, onChange, onNext, onBack }: StepStyleProps) {

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-xl font-bold text-center mb-6 text-white uppercase tracking-widest opacity-60">Choose Style</h2>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center flex-1">
                {/* Realistic Option */}
                <button
                    onClick={() => onChange('realistic')}
                    className={`group relative w-56 h-80 rounded-2xl overflow-hidden transition-all duration-300 border-2 ${value === 'realistic' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-60 hover:opacity-100'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                    <div className="absolute inset-0 bg-[#2a2a2e] flex items-center justify-center bg-cover bg-center">
                        <span className="text-5xl drop-shadow-lg filter grayscale group-hover:grayscale-0 transition-all">📸</span>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${value === 'realistic' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                            Realistic
                        </span>
                    </div>
                </button>

                {/* Anime Option */}
                <button
                    onClick={() => onChange('anime')}
                    className={`group relative w-56 h-80 rounded-2xl overflow-hidden transition-all duration-300 border-2 ${value === 'anime' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-60 hover:opacity-100'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                    <div className="absolute inset-0 bg-[#2a2a2e] flex items-center justify-center bg-cover bg-center">
                        <span className="text-5xl drop-shadow-lg filter grayscale group-hover:grayscale-0 transition-all">🎨</span>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${value === 'anime' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                            Anime
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
}
