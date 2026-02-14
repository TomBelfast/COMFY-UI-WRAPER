"use client";

interface StepGenderProps {
    value?: 'female' | 'male';
    onChange: (val: 'female' | 'male') => void;
    onNext: () => void;
}

export default function StepGender({ value, onChange, onNext }: StepGenderProps) {

    const handleSelect = (val: 'female' | 'male') => {
        onChange(val);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-full mx-auto pb-20 animate-fade-in relative h-full justify-center">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-12 text-center shrink-0">
                Choose <span className="text-emerald-500">Gender</span>
            </h2>

            <div className="flex flex-col md:flex-row gap-12 justify-center items-center w-full px-8">
                {/* Female Option */}
                <button
                    onClick={() => handleSelect('female')}
                    className={`group relative w-[400px] h-[600px] rounded-[32px] overflow-hidden transition-all duration-500 border-2 ${value === 'female' ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-60 hover:opacity-100'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                    <img
                        src="/assets/character-creator/gender-female.png"
                        alt="Female"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute bottom-10 left-0 right-0 text-center z-20">
                        <span className={`inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-[0.3em] transition-colors ${value === 'female' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                            Female
                        </span>
                    </div>
                </button>

                {/* Male Option */}
                <button
                    onClick={() => handleSelect('male')}
                    className={`group relative w-[400px] h-[600px] rounded-[32px] overflow-hidden transition-all duration-500 border-2 ${value === 'male' ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-60 hover:opacity-100'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                    <img
                        src="/assets/character-creator/gender-male.png"
                        alt="Male"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute bottom-10 left-0 right-0 text-center z-20">
                        <span className={`inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-[0.3em] transition-colors ${value === 'male' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                            Male
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
}
