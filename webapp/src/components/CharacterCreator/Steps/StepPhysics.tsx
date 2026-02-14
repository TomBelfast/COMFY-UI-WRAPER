"use client";

interface StepPhysicsProps {
    ethnicity?: string;
    age?: number;
    eyeColor?: string;
    onChange: (key: string, val: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const ETHNICITIES = [
    { id: 'caucasian', label: 'Caucasian', icon: '👱' },
    { id: 'latino', label: 'Latino', icon: '🧔🏽' },
    { id: 'asian', label: 'Asian', icon: '👦🏻' },
    { id: 'arab', label: 'Arab', icon: '👳🏽' },
    { id: 'black', label: 'Black/Afro', icon: '👨🏿' },
];

const EYE_COLORS = [
    { id: 'brown', label: 'Brown', color: '#634e34' },
    { id: 'blue', label: 'Blue', color: '#4e7ba6' },
    { id: 'green', label: 'Green', color: '#4ea65b' },
];

export default function StepPhysics({ ethnicity, age, eyeColor, onChange, onNext, onBack }: StepPhysicsProps) {

    const isValid = ethnicity && age && eyeColor;

    return (
        <div className="flex flex-col items-center w-full max-w-full mx-auto animate-fade-in relative h-full justify-start px-4">
            <div className="space-y-10 w-full flex flex-col items-center">

                {/* 1. Ethnicity */}
                <section className="text-center w-full max-w-6xl">
                    <h3 className="text-[10px] font-bold text-white/40 mb-4 uppercase tracking-[0.5em]">Architectural <span className="text-emerald-500">Ethnicity</span></h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {ETHNICITIES.map((eth) => (
                            <button
                                key={eth.id}
                                onClick={() => onChange('ethnicity', eth.id)}
                                className={`group relative h-[260px] rounded-[32px] overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-end pb-6
                                    ${ethnicity === eth.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <img
                                        src={`/assets/character-creator/ethnicity-${eth.id}.png`}
                                        alt={eth.label}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                </div>
                                <span className={`relative z-10 text-[10px] font-black uppercase tracking-[0.3em] ${ethnicity === eth.id ? 'text-emerald-400' : 'text-white/80'}`}>
                                    {eth.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Age */}
                <section className="text-center px-4 md:px-12 w-full max-w-3xl">
                    <h3 className="text-[10px] font-bold text-white/40 mb-4 uppercase tracking-[0.5em]">Temporal <span className="text-emerald-500">Age Index</span></h3>
                    <div className="text-5xl font-black text-emerald-400 mb-4 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]">{age || 18}</div>

                    <div className="relative w-full h-2.5 bg-white/5 rounded-full border border-white/5">
                        <div
                            className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                            style={{ width: `${((age || 18) - 18) / (70 - 18) * 100}%` }}
                        />
                        <input
                            type="range"
                            min="18"
                            max="70"
                            value={age || 18}
                            onChange={(e) => onChange('age', parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] pointer-events-none transition-all flex items-center justify-center border-4 border-emerald-500"
                            style={{ left: `calc(${((age || 18) - 18) / (70 - 18) * 100}% - 20px)` }}
                        >
                            <div className="w-4 h-4 rounded-full bg-black shadow-inner" />
                        </div>
                    </div>
                </section>

                {/* 3. Eye Color */}
                <section className="text-center w-full max-w-4xl">
                    <h3 className="text-[10px] font-bold text-white/40 mb-4 uppercase tracking-[0.5em]">Optical <span className="text-emerald-500">Spectrum</span></h3>
                    <div className="flex flex-wrap justify-center gap-6">
                        {EYE_COLORS.map((eye) => (
                            <button
                                key={eye.id}
                                onClick={() => onChange('eyeColor', eye.id)}
                                className={`group relative w-56 h-24 rounded-[24px] overflow-hidden transition-all duration-300 border-2
                                    ${eyeColor === eye.id
                                        ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-110'
                                        : 'border-white/10 hover:border-white/30'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-[#050505]">
                                    <div
                                        className="w-16 h-8 rounded-[100%] bg-white flex items-center justify-center overflow-hidden relative shadow-inner"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full absolute"
                                            style={{ backgroundColor: eye.color }}
                                        />
                                        <div className="w-3 h-3 bg-black rounded-full absolute" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 py-6 text-center">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${eyeColor === eye.id ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'}`}>
                                        {eye.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

        </div>
    );
}
