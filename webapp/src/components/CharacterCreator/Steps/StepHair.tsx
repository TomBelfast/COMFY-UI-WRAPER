"use client";

interface StepHairProps {
    hairLength?: string;
    hairType?: string;
    hairColor?: string;
    onChange: (key: string, val: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const HAIR_LENGTHS = [
    { id: 'short', label: 'Short', icon: '💇‍♂️' },
    { id: 'medium', label: 'Medium', icon: '💇' },
    { id: 'long', label: 'Long', icon: '💇‍♀️' },
];

const HAIR_TYPES = [
    { id: 'straight', label: 'Straight', icon: '📏' },
    { id: 'wavy', label: 'Wavy', icon: '〰️' },
    { id: 'curly', label: 'Curly', icon: '➰' },
    { id: 'kinky', label: 'Coily', icon: '🌀' },
];

const HAIR_COLORS = [
    { id: 'blonde', label: 'Blonde', color: '#e6cba5' },
    { id: 'brown', label: 'Brown', color: '#634e34' },
    { id: 'black', label: 'Black', color: '#1a1a1a' },
    { id: 'red', label: 'Red', color: '#a64e4e' },
    { id: 'gray', label: 'Gray', color: '#9e9e9e' },
    { id: 'white', label: 'White', color: '#ffffff' },
    { id: 'pink', label: 'Pink', color: '#ffc0cb' },
    { id: 'blue', label: 'Blue', color: '#4e7ba6' },
];


export default function StepHair({ hairLength, hairType, hairColor, onChange, onNext, onBack }: StepHairProps) {

    // Check if we have enough data to proceed (maybe optional?)
    const isValid = hairLength && hairType && hairColor;

    return (
        <div className="flex flex-col items-center w-full max-w-full mx-auto animate-fade-in relative h-full justify-start px-4">
            <div className="space-y-8 w-full flex flex-col items-center">

                {/* 1. Hair Length */}
                <section className="text-center w-full max-w-5xl">
                    <h3 className="text-[10px] font-bold text-white/40 mb-4 uppercase tracking-[0.5em]">Linear <span className="text-emerald-500">Length</span></h3>
                    <div className="flex justify-center gap-8">
                        {HAIR_LENGTHS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('hairLength', item.id)}
                                className={`group relative w-44 h-[260px] rounded-[32px] overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-end pb-6
                                    ${hairLength === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <img
                                        src={`/assets/character-creator/hair-length-${item.id}.png`}
                                        alt={item.label}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                </div>
                                <span className={`relative z-10 text-[10px] font-black uppercase tracking-[0.3em] ${hairLength === item.id ? 'text-emerald-400' : 'text-white/80'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Hair Type */}
                <section className="text-center w-full max-w-5xl">
                    <h3 className="text-[10px] font-bold text-white/40 mb-4 uppercase tracking-[0.5em]">Structural <span className="text-emerald-500">Form</span></h3>
                    <div className="flex justify-center gap-8">
                        {HAIR_TYPES.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('hairType', item.id)}
                                className={`group relative w-44 h-[260px] rounded-[32px] overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-end pb-6
                                    ${hairType === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <img
                                        src={`/assets/character-creator/hair-type-${item.id === 'kinky' ? 'coily' : item.id}.png`}
                                        alt={item.label}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                </div>
                                <span className={`relative z-10 text-[10px] font-black uppercase tracking-[0.3em] ${hairType === item.id ? 'text-emerald-400' : 'text-white/80'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. Hair Color */}
                <section className="text-center w-full">
                    <h3 className="text-[10px] font-bold text-white/40 mb-4 uppercase tracking-[0.5em]">Chromatic <span className="text-emerald-500">Tone</span></h3>
                    <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto px-4">
                        {HAIR_COLORS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('hairColor', item.id)}
                                className={`group relative rounded-full overflow-hidden transition-all duration-300 border-2 flex items-center gap-3 pl-2 pr-6 py-2
                                    ${hairColor === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white/20 shadow-xl"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${hairColor === item.id ? 'text-emerald-400' : 'text-white/60'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

        </div>
    );
}
