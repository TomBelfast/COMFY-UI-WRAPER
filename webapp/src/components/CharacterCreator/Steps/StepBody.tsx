"use client";

interface StepBodyProps {
    gender: 'female' | 'male' | undefined;
    bodyType?: string;
    breastSize?: string;
    onChange: (key: string, val: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const BODY_TYPES_MALE = [
    { id: 'slim', label: 'Slim', icon: '🏃' },
    { id: 'muscular', label: 'Muscular', icon: '🏋️' },
    { id: 'wide', label: 'Wide', icon: '🧘' },
];

const BODY_TYPES_FEMALE = [
    { id: 'skinny', label: 'Skinny', icon: '🧣' },
    { id: 'athletic', label: 'Athletic', icon: '🤸‍♀️' },
    { id: 'average', label: 'Average', icon: '🚶‍♀️' },
    { id: 'curvy', label: 'Curvy', icon: '💃' },
    { id: 'bbw', label: 'BBW', icon: '🧘‍♀️' },
];

const BREAST_SIZES = [
    { id: 'small', label: 'Small', icon: '🍩' }, // Abstract icons
    { id: 'medium', label: 'Medium', icon: '🍎' },
    { id: 'large', label: 'Large', icon: '🍈' },
    { id: 'extra_large', label: 'Extra Large', icon: '🍉' },
];

export default function StepBody({ gender, bodyType, breastSize, onChange, onNext, onBack }: StepBodyProps) {

    // Male requirements: just bodyType
    // Female requirements: bodyType AND breastSize
    const isValid = gender === 'male'
        ? !!bodyType
        : (!!bodyType && !!breastSize);

    return (
        <div className="flex flex-col h-full animate-fade-in">

            <div className="space-y-4">

                {/* 1. Body Type */}
                <section className="text-center">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Choose Body Type</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {(gender === 'male' ? BODY_TYPES_MALE : BODY_TYPES_FEMALE).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('bodyType', item.id)}
                                className={`group relative w-28 h-32 rounded-xl overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-end pb-3
                                    ${bodyType === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <span className="text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {item.icon}
                                </span>
                                <span className={`relative z-10 text-[9px] font-black uppercase tracking-widest ${bodyType === item.id ? 'text-emerald-400' : 'text-white/60'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Breast Size (Female Only) */}
                {gender === 'female' && (
                    <section className="text-center animate-fade-in">
                        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Choose Breast Size</h3>
                        <div className="flex justify-center gap-3">
                            {BREAST_SIZES.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onChange('breastSize', item.id)}
                                    className={`group relative w-24 h-24 rounded-xl overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-center gap-1
                                        ${breastSize === item.id
                                            ? 'border-emerald-500 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105'
                                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100">
                                        <span className="text-2xl">{item.icon}</span>
                                    </div>

                                    <span className={`text-[9px] font-black uppercase tracking-widest ${breastSize === item.id ? 'text-emerald-400' : 'text-white/60'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>

        </div>
    );
}
