"use client";

interface WizardStepperProps {
    steps: string[];
    currentStep: number;
    onStepClick: (step: number) => void;
}

export default function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
    return (
        <div className="w-full flex items-center justify-between px-10 relative">
            {/* Progress Track (Background Line) */}
            <div className="absolute left-[3rem] right-[3rem] top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-10">
                {/* Active Line Progress */}
                <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{
                        width: `${(currentStep / (steps.length - 1)) * 100}%`
                    }}
                />
            </div>

            {steps.map((step, index) => {
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                    <button
                        key={step}
                        onClick={() => onStepClick(index)}
                        disabled={index > currentStep}
                        className={`relative group flex flex-col items-center justify-center gap-3 transition-all ${index > currentStep ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                        <div
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 flex items-center justify-center
                                ${isActive ? 'bg-emerald-500 border-emerald-500 scale-125' : 'bg-[#18181b] border-white/20 group-hover:border-white/40'}
                                ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}
                            `}
                        >
                            {isActive && (
                                <svg className="w-2.5 h-2.5 text-black" fill="bg-black" viewBox="0 0 20 20" stroke="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        {isCurrent && (
                            <span className="absolute -bottom-8 text-[10px] uppercase font-bold tracking-widest text-emerald-400 animate-fade-in whitespace-nowrap">
                                {step}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
