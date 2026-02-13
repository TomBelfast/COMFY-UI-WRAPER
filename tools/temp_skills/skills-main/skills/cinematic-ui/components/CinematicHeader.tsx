import { cn } from "@/lib/utils";

interface CinematicHeaderProps {
    title: string;
    label?: string;
    className?: string;
}

export function CinematicHeader({ title, label, className }: CinematicHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {label && <span className="text-label">{label}</span>}
            <h2 className="text-3xl text-title">{title}</h2>
        </div>
    );
}
