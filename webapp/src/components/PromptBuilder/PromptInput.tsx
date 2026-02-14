
"use client";

interface PromptInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    isTextArea?: boolean;
}

export default function PromptInput({ id, label, value, onChange, placeholder, isTextArea }: PromptInputProps) {
    return (
        <div id={`${id}-container`} className="space-y-2">
            <label id={`${id}-label`} className="text-label block mb-2">{label}</label>
            {isTextArea ? (
                <textarea
                    id={id}
                    className="input-glass h-32 resize-none w-full"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    suppressHydrationWarning
                />
            ) : (
                <input
                    id={id}
                    type="text"
                    className="input-glass w-full"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    suppressHydrationWarning
                />
            )}
        </div>
    );
}
