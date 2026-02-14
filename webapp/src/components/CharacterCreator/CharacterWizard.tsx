"use client";

import { useState, useEffect } from "react";
import WizardStepper from "./WizardStepper";
import StepGender from "./Steps/StepGender";
import StepStyle from "./Steps/StepStyle";
import StepPhysics from "./Steps/StepPhysics";
import StepHair from "./Steps/StepHair";
import StepBody from "./Steps/StepBody";
import StepResult from "./Steps/StepResult";

export interface CharacterState {
    gender?: 'female' | 'male';
    style?: 'realistic' | 'anime';
    ethnicity?: string;
    age?: number;
    eyeColor?: string;
    hairLength?: string;
    hairType?: string;
    hairColor?: string;
    bodyType?: string;
    breastSize?: string;
    personality?: string;
    voice?: string;
    pose?: string;
    outfit?: string;
    location?: string;
}

const STEPS = [
    "Gender",
    "Style",
    "Physics",
    "Hair",
    "Body",
    "Result"
];

export default function CharacterWizard() {
    const [isMounted, setIsMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [characterData, setCharacterData] = useState<CharacterState>({ age: 27 });
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize state from localStorage after mount
    useEffect(() => {
        setIsMounted(true);
        const savedStep = localStorage.getItem('wizard_step');
        if (savedStep) setCurrentStep(parseInt(savedStep));

        const savedData = localStorage.getItem('wizard_data');
        if (savedData) setCharacterData(JSON.parse(savedData));

        const savedPrompt = localStorage.getItem('wizard_prompt');
        if (savedPrompt) setGeneratedPrompt(savedPrompt);
    }, []);

    if (!isMounted) {
        return <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>;
    }

    const updateData = (key: keyof CharacterState, value: any) => {
        const newData = { ...characterData, [key]: value };
        setCharacterData(newData);
        localStorage.setItem('wizard_data', JSON.stringify(newData));
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            const next = currentStep + 1;
            setCurrentStep(next);
            localStorage.setItem('wizard_step', next.toString());
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            const prev = currentStep - 1;
            setCurrentStep(prev);
            localStorage.setItem('wizard_step', prev.toString());
        }
    };

    const goToStep = (stepIndex: number) => {
        if (stepIndex <= currentStep || (currentStep === 4 && stepIndex === 5)) {
            setCurrentStep(stepIndex);
            localStorage.setItem('wizard_step', stepIndex.toString());
        }
    };

    const isStepValid = () => {
        const d = characterData;
        switch (currentStep) {
            case 0: return !!d.gender;
            case 1: return !!d.style;
            case 2: return !!(d.ethnicity && d.age && d.eyeColor);
            case 3: return !!(d.hairLength && d.hairType && d.hairColor);
            case 4: return !!(d.gender === 'male' ? d.bodyType : (d.bodyType && d.breastSize));
            default: return true;
        }
    };

    const handleNext = () => {
        if (!isStepValid()) return;

        if (currentStep === 4) {
            const { age, ethnicity, gender, style, hairLength, hairColor, hairType, eyeColor, bodyType, breastSize } = characterData;
            const ageText = age ? `${age} year old` : "young";
            const isMale = gender === 'male';
            const isAnime = style === 'anime';
            const subjectAdjective = isMale ? "handsome" : "beautiful";
            const subjectNoun = isMale ? "man" : "woman";
            const outfit = isMale ? "vibrant orange swimming trunks" : "vibrant orange bikini";
            const physicalDetails = isMale
                ? `${bodyType || 'muscular'} body`
                : `${bodyType || 'average'} body${breastSize ? `, ${breastSize} breasts` : ''}`;

            let basePrompt = "";
            if (isAnime) {
                basePrompt = `Anime style illustration, high quality digital art, cel shaded, ${subjectAdjective} ${ageText} ${ethnicity || 'European'} ${subjectNoun} with ${hairLength || 'long'} ${hairType || ''} ${hairColor || 'black'} hair and striking ${eyeColor || 'blue'} eyes, ${physicalDetails}, standing full body in a ${outfit}, confident smile, hands on hips, entire body visible, neutral pink background, sharp lines, vibrant colors, masterpiece, 4k`;
            } else {
                basePrompt = `A ${subjectAdjective} ${ageText} ${ethnicity || 'European'} ${subjectNoun} with ${hairLength || 'short'} ${hairType || ''} ${hairColor || 'black'} hair and striking ${eyeColor || 'blue'} eyes, ${physicalDetails}, standing full body in a ${outfit}, confident smile, hands on hips, relaxed and happy pose, entire body visible including bare feet, neutral pink studio background, professional photography lighting, soft even illumination, high detail, realistic skin texture, photorealistic, 8k, sharp focus`;
            }

            // ONLY update if it actually changed
            if (basePrompt !== generatedPrompt) {
                setGeneratedPrompt(basePrompt);
                localStorage.setItem('wizard_prompt', basePrompt);
                // Clear the match guard so StepResult knows it's a new prompt
                localStorage.setItem('wizard_last_generated_prompt', '');
            }

            setCurrentStep(5);
            localStorage.setItem('wizard_step', "5");
        } else {
            nextStep();
        }
    };

    const isVisible = currentStep < 5;
    const hasExistingResult = generatedPrompt && generatedPrompt.length > 0;

    const STEP_LABELS = [
        { title: "CHOOSE", highlight: "GENDER" },
        { title: "ANALYZE", highlight: "STYLE" },
        { title: "DEFINE", highlight: "PHYSICS" },
        { title: "MANUFACTURE", highlight: "HAIR" },
        { title: "RECONSTRUCT", highlight: "BODY" },
        { title: "MATRIX", highlight: "RESULT" }
    ];

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-0">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
                    Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Character</span>
                </h1>
                <div className="flex flex-col items-center">
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mb-4" />
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white/90 animate-pulse">
                        {STEP_LABELS[currentStep].title} <span className="text-emerald-500">{STEP_LABELS[currentStep].highlight}</span>
                    </h2>
                </div>
            </div>

            <WizardStepper
                steps={STEPS}
                currentStep={currentStep}
                onStepClick={goToStep}
            />

            <div className="relative group">
                {/* Navigation - BACK */}
                {currentStep > 0 && (
                    <button
                        className="absolute -left-32 top-1/2 -translate-y-1/2 z-[100] p-6 bg-white/5 hover:bg-emerald-500/20 rounded-full text-white/20 hover:text-emerald-400 transition-all backdrop-blur-md border border-white/5 group/nav"
                        onClick={prevStep}
                        title="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/nav:scale-110 transition-transform"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                )}

                {/* Navigation - NEXT / GENERATE */}
                {currentStep < 5 && isVisible && (
                    <button
                        className={`absolute -right-32 top-1/2 -translate-y-1/2 z-[100] p-6 transition-all backdrop-blur-md border group/nav shadow-2xl rounded-full
                            ${isStepValid()
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-500 border-emerald-500/30'
                                : 'bg-white/5 text-white/10 border-white/5 cursor-not-allowed opacity-50'}
                            ${currentStep === 4 && !hasExistingResult && isStepValid() ? 'snake-active' : ''}
                        `}
                        style={{ '--snake-radius': '9999px' } as React.CSSProperties}
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        title={currentStep === 4 ? (hasExistingResult ? "Next to Result" : "Generate Matrix") : "Next Step"}
                    >
                        {currentStep === 4 && !hasExistingResult ? (
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/nav:scale-110 transition-transform animate-pulse"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl animate-pulse -z-10" />
                            </div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/nav:scale-110 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        )}
                    </button>
                )}

                <div
                    className={`h-[850px] glass-card p-8 rounded-[40px] border border-white/5 relative bg-[#18181b]/30 backdrop-blur-3xl shadow-2xl transition-all duration-500 w-full flex flex-col items-center justify-start ${(isGenerating || (currentStep === 4 && isStepValid() && !hasExistingResult)) ? 'snake-active' : ''}`}
                    style={{ '--snake-radius': '40px' } as React.CSSProperties}
                >
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -ml-48 -mb-48 animate-pulse pointer-events-none" />

                    <div className="h-full w-full flex flex-col relative z-10 pt-8">

                        {currentStep === 0 && (
                            <StepGender
                                value={characterData.gender}
                                onChange={(val: 'female' | 'male') => updateData('gender', val)}
                                onNext={handleNext}
                            />
                        )}

                        {currentStep === 1 && (
                            <StepStyle
                                value={characterData.style}
                                onChange={(val) => updateData('style', val)}
                                onNext={handleNext}
                                onBack={prevStep}
                            />
                        )}

                        {currentStep === 2 && (
                            <StepPhysics
                                ethnicity={characterData.ethnicity}
                                age={characterData.age}
                                eyeColor={characterData.eyeColor}
                                onChange={(key, val) => updateData(key as keyof CharacterState, val)}
                                onNext={handleNext}
                                onBack={prevStep}
                            />
                        )}

                        {currentStep === 3 && (
                            <StepHair
                                hairLength={characterData.hairLength}
                                hairType={characterData.hairType}
                                hairColor={characterData.hairColor}
                                onChange={(key, val) => updateData(key as keyof CharacterState, val)}
                                onNext={handleNext}
                                onBack={prevStep}
                            />
                        )}

                        {currentStep === 4 && (
                            <StepBody
                                gender={characterData.gender}
                                bodyType={characterData.bodyType}
                                breastSize={characterData.breastSize}
                                onChange={(key, val) => updateData(key as keyof CharacterState, val)}
                                onNext={handleNext}
                                onBack={prevStep}
                            />
                        )}

                        {currentStep === 5 && (
                            <StepResult
                                prompt={generatedPrompt}
                                onBack={() => setCurrentStep(4)}
                                onGeneratingChange={setIsGenerating}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
