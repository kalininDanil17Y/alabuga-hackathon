import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import avatarGlow from "@/images/ui/header/avatar-glow.webp";
import styles from "./circular-progress-avatar.module.css";

type CSSVars = React.CSSProperties & { ["--progress"]?: string };

export interface CircularProgressAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src: string;
    alt: string;
    progress: number; // 0..1
    size?: number;
    level?: number;
}

export function CircularProgressAvatar({
    src,
    alt,
    progress,
    size = 88,
    level,
    className,
    ...props
}: CircularProgressAvatarProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const ringWidth = Math.max(6, Math.round(size * 0.14));
    const trackInset = +(ringWidth * 0.45).toFixed(2);
    const avatarInset = +(ringWidth + trackInset).toFixed(2);
    const TRANSITION_DURATION = 400; // sync with CSS transition (ms)
    const RESET_DELAY = 60; // small delay to apply zero state without flash (ms)
    const MAX_COMPLETION_LOOPS = 2;
    const PROGRESS_EPSILON = 0.0001;

    const [displayProgress, setDisplayProgress] = useState(clampedProgress);
    const [isTransitionEnabled, setTransitionEnabled] = useState(true);

    const previousLevelRef = useRef<number | undefined>(level);
    const previousProgressRef = useRef(clampedProgress);
    const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

    useEffect(() => {
        const clearScheduled = () => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
        };

        clearScheduled();

        const schedule = (callback: () => void, delay: number) => {
            const timeoutId = setTimeout(callback, delay);
            timeoutsRef.current.push(timeoutId);
        };

        const previousLevel = previousLevelRef.current ?? level;
        const levelDelta = typeof level === "number" && typeof previousLevel === "number" ? level - previousLevel : 0;
        const progressDecreased = clampedProgress < previousProgressRef.current - PROGRESS_EPSILON;
        const shouldPlayCompletionLoop = levelDelta > 0 || progressDecreased;

        if (!shouldPlayCompletionLoop) {
            setTransitionEnabled(true);
            setDisplayProgress(clampedProgress);
        } else {
            const loopsToPlay = Math.max(1, Math.min(MAX_COMPLETION_LOOPS, levelDelta > 0 ? levelDelta : 1));
            let accumulatedDelay = 0;

            for (let loop = 0; loop < loopsToPlay; loop += 1) {
                schedule(() => {
                    setTransitionEnabled(true);
                    setDisplayProgress(1);
                }, accumulatedDelay);
                accumulatedDelay += TRANSITION_DURATION;

                schedule(() => {
                    setTransitionEnabled(false);
                    setDisplayProgress(0);
                }, accumulatedDelay);
                accumulatedDelay += RESET_DELAY;
            }

            schedule(() => {
                setTransitionEnabled(true);
                setDisplayProgress(clampedProgress);
            }, accumulatedDelay);
        }

        previousProgressRef.current = clampedProgress;
        previousLevelRef.current = level;

        return clearScheduled;
    }, [clampedProgress, level]);

    const angle = displayProgress * 360;

    const gradientStyle: CSSVars = { "--progress": `${angle}deg` };

    return (
        <div
            className={clsx(styles.root, className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <div
                className={styles.gradientOverlay}
                style={{
                    ...gradientStyle,
                    transition: isTransitionEnabled ? undefined : "none",
                }}
            />
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
