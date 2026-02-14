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
        <div className="flex flex-col h-full animate-fade-in">

            <div className="space-y-4">

                {/* 1. Hair Length */}
                <section className="text-center">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Hair Length</h3>
                    <div className="flex justify-center gap-3">
                        {HAIR_LENGTHS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('hairLength', item.id)}
                                className={`group relative w-28 h-28 rounded-xl overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-center gap-1
                                    ${hairLength === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <span className="text-3xl">{item.icon}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${hairLength === item.id ? 'text-emerald-400' : 'text-white/60'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Hair Type */}
                <section className="text-center">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Hair Type</h3>
                    <div className="flex justify-center gap-3">
                        {HAIR_TYPES.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('hairType', item.id)}
                                className={`group relative w-28 h-28 rounded-xl overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-center gap-1
                                    ${hairType === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <span className="text-3xl">{item.icon}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${hairType === item.id ? 'text-emerald-400' : 'text-white/60'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. Hair Color */}
                <section className="text-center">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Hair Color</h3>
                    <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
                        {HAIR_COLORS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('hairColor', item.id)}
                                className={`group relative rounded-full overflow-hidden transition-all duration-300 border-2 flex items-center gap-2 pl-1 pr-3 py-1
                                    ${hairColor === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <div
                                    className="w-6 h-6 rounded-full border border-white/10"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${hairColor === item.id ? 'text-emerald-400' : 'text-white/60'}`}>
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
