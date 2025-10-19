import clsx from "clsx";
import avatarGlow from "@/images/ui/header/avatar-glow.webp";
import styles from "./circular-progress-avatar.module.css";

type CSSVars = React.CSSProperties & { ["--progress"]?: string };

export interface CircularProgressAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src: string;
    alt: string;
    progress: number; // 0..1
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
    const angle = clampedProgress * 360;

    const gradientStyle: CSSVars = { "--progress": `${angle}deg` };

    return (
        <div
            className={clsx(styles.root, className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <div className={styles.gradientOverlay} style={gradientStyle} />
            <div className={styles.radianceOverlay} />
            <img src={avatarGlow} alt="Avatar glow overlay" className={styles.glowImage} />
            <div className={styles.track} style={{ inset: `${trackInset}px` }} />
            <div className={styles.avatarWrapper} style={{ inset: `${avatarInset}px` }}>
                <img src={src} alt={alt} className={styles.avatarImage} />
            </div>
            <div className={styles.borderOverlay} />
            <div className={styles.lightOverlay} />
        </div>
    );
}
