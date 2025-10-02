import { cn } from "@/lib/utils";
import avatar_glow_avatar from '@/images/ui/header/avatar-glow.webp';

export interface CircularProgressAvatarProps
    extends React.HTMLAttributes<HTMLDivElement> {
    src: string;
    alt: string;
    progress: number;
    size?: number;
}

export function CircularProgressAvatar({
                                           src,
                                           alt,
                                           progress,
                                           size = 88,
                                           className,
                                           ...props
                                       }: CircularProgressAvatarProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const ringWidth = Math.max(6, Math.round(size * 0.14));
    const trackInset = +(ringWidth * 0.45).toFixed(2);
    const avatarInset = +(ringWidth + trackInset).toFixed(2);
    const progressDegrees = +(clampedProgress * 360).toFixed(2);

    const ringGradient = `conic-gradient(from 90deg, rgba(11, 171, 249, 0.95) ${progressDegrees}deg, rgba(10, 18, 60, 0.6) ${progressDegrees}deg 360deg)`;

    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <div
                className="absolute inset-0 rounded-full"
                style={{ background: ringGradient }}
            />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(106,207,246,0.35)_0%,rgba(12,23,81,0.6)_65%,rgba(6,12,46,0.85)_100%)] mix-blend-screen opacity-70" />
            <img
                src={avatar_glow_avatar}
                alt="Avatar glow overlay"
                className="avatar-glow pointer-events-none absolute inset-0 rounded-full object-cover mix-blend-screen opacity-80"
                style={{ zIndex: 10 }}
            />
            <div
                className="absolute rounded-full border border-space-blue-700/70 bg-space-blue-900/80 shadow-[0_0_18px_rgba(11,171,249,0.35)]"
                style={{ inset: `${trackInset}px` }}
            />
            <div
                className="absolute rounded-full overflow-hidden shadow-[0_0_12px_rgba(11,171,249,0.45)]"
                style={{ inset: `${avatarInset}px` }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="absolute inset-0 h-full w-full object-cover z-[1]"
                />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_90deg,rgba(255,255,255,0.32)_0deg,rgba(255,255,255,0)_120deg)] opacity-60" />
        </div>
    );
}
