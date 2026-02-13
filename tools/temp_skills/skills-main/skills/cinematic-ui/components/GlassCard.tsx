import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    threeD?: boolean;
}

export function GlassCard({ className, threeD = false, children, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                threeD ? "card-3d-cinematic" : "glass-card",
                "p-6 rounded-2xl relative overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Subtle glow light effect */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/5 blur-[120px] pointer-events-none" />
            {children}
        </div>
    );
}
