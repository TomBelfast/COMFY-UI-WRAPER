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
        <div className="flex flex-col items-center w-full max-w-full mx-auto animate-fade-in relative h-full justify-start px-4">
            <div className="space-y-4 w-full flex flex-col items-center">

                {/* 1. Body Type */}
                <section className="text-center w-full max-w-6xl">
                    <h3 className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-[0.5em]">Structural <span className="text-emerald-500">Body Type</span></h3>
                    <div className="grid grid-cols-5 gap-4">
                        {(gender === 'male' ? BODY_TYPES_MALE : BODY_TYPES_FEMALE).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChange('bodyType', item.id)}
                                className={`group relative h-[320px] rounded-[24px] overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-end pb-6
                                    ${bodyType === item.id
                                        ? 'border-emerald-500 bg-white/10 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <img
                                        src={`/assets/character-creator/body-${gender}-${item.id}.png`}
                                        alt={item.label}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                </div>
                                <span className={`relative z-10 text-[10px] font-black uppercase tracking-[0.3em] ${bodyType === item.id ? 'text-emerald-400' : 'text-white/80'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Breast Size (Female Only) */}
                {gender === 'female' && (
                    <section className="text-center animate-fade-in w-full max-w-5xl pt-4">
                        <h3 className="text-[10px] font-bold text-white/40 mb-5 uppercase tracking-[0.5em]">Cubic <span className="text-emerald-500">Volume</span></h3>
                        <div className="flex justify-center gap-10">
                            {BREAST_SIZES.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onChange('breastSize', item.id)}
                                    className={`group relative w-48 h-48 rounded-[32px] overflow-hidden transition-all duration-300 border-2 flex flex-col items-center justify-end pb-6
                                        ${breastSize === item.id
                                            ? 'border-emerald-500 bg-white/10 shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-110'
                                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                        <img
                                            src={`/assets/character-creator/breast-${item.id}.png`}
                                            alt={item.label}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    </div>
                                    <span className={`relative z-10 text-[10px] font-black uppercase tracking-[0.3em] ${breastSize === item.id ? 'text-emerald-400' : 'text-white/80'}`}>
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
