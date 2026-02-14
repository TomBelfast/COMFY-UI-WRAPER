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
        <div className="flex flex-col h-full animate-fade-in">

            <div className="space-y-4 h-full">

                {/* 1. Ethnicity */}
                <section className="text-center">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Choose Ethnicity</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {ETHNICITIES.map((eth) => (
                            <button
                                key={eth.id}
                                onClick={() => onChange('ethnicity', eth.id)}
                                className={`group relative h-32 rounded-xl overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-end pb-3
                                    ${ethnicity === eth.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-3xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {eth.icon}
                                </div>
                                <span className={`relative z-10 text-[9px] font-black uppercase tracking-widest ${ethnicity === eth.id ? 'text-emerald-400' : 'text-white/60'}`}>
                                    {eth.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Age */}
                <section className="text-center px-4 md:px-12">
                    <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-widest opacity-60">Choose Age</h3>
                    <div className="text-3xl font-black text-emerald-400 mb-2">{age || 18}</div>

                    <div className="relative w-full h-1.5 bg-white/10 rounded-full">
                        <div
                            className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
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
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-all"
                            style={{ left: `calc(${((age || 18) - 18) / (70 - 18) * 100}% - 10px)` }}
                        >
                            <div className="absolute inset-0 m-1 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                    <div className="flex justify-between text-[8px] text-white/30 font-bold mt-2 uppercase tracking-widest">
                        <span>18 Years</span>
                        <span>70 Years</span>
                    </div>
                </section>

                {/* 3. Eye Color */}
                <section className="text-center">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Choose Eye Color</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {EYE_COLORS.map((eye) => (
                            <button
                                key={eye.id}
                                onClick={() => onChange('eyeColor', eye.id)}
                                className={`group relative w-28 h-16 rounded-xl overflow-hidden transition-all duration-300 border-2
                                    ${eyeColor === eye.id
                                        ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                        : 'border-white/10 hover:border-white/30'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#121212]">
                                    <div
                                        className="w-10 h-5 rounded-[100%] bg-white flex items-center justify-center overflow-hidden relative shadow-inner"
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full absolute"
                                            style={{ backgroundColor: eye.color }}
                                        />
                                        <div className="w-1.5 h-1.5 bg-black rounded-full absolute" />
                                    </div>
                                </div>
                                <div className="absolute bottom-1.5 left-0 right-0 text-center">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${eyeColor === eye.id ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'}`}>
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
