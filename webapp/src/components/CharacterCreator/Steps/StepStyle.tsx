"use client";

interface StepStyleProps {
    value?: 'realistic' | 'anime';
    onChange: (val: 'realistic' | 'anime') => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepStyle({ value, onChange, onNext, onBack }: StepStyleProps) {

    return (
        <div className="flex flex-col items-center w-full max-w-full mx-auto animate-fade-in relative h-full justify-start">
            <div className="flex flex-col md:flex-row gap-12 justify-center items-center w-full px-8 mt-4">
                {/* Realistic Option */}
                <button
                    onClick={() => onChange('realistic')}
                    className={`group relative w-[420px] h-[680px] rounded-[40px] overflow-hidden transition-all duration-500 border-2 ${value === 'realistic' ? 'border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-60 hover:opacity-100'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-10" />

                    <img
                        src="/assets/character-creator/style-realistic.png"
                        alt="Realistic"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute bottom-0 left-0 right-0 py-6 text-center z-20">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${value === 'realistic' ? 'text-emerald-400' : 'text-white/80'}`}>
                            Realistic
                        </span>
                    </div>
                </button>

                {/* Anime Option */}
                <button
                    onClick={() => onChange('anime')}
                    className={`group relative w-[420px] h-[680px] rounded-[40px] overflow-hidden transition-all duration-500 border-2 ${value === 'anime' ? 'border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-60 hover:opacity-100'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-10" />

                    <img
                        src="/assets/character-creator/style-anime.png"
                        alt="Anime"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute bottom-0 left-0 right-0 py-6 text-center z-20">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${value === 'anime' ? 'text-emerald-400' : 'text-white/80'}`}>
                            Anime
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
}
