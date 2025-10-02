import React from "react";
import clsx from "clsx";
import styles from "./space-progress.module.css";

interface SpaceProgressProps {
    value: number;
    max: number;
    label?: string;
    className?: string;
    showPercentage?: boolean;
    showValues?: boolean;
    animated?: boolean;
}

const SpaceProgress: React.FC<SpaceProgressProps> = ({
    value,
    max,
    label,
    className,
    showPercentage = false,
    showValues = true,
    animated = true,
}) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={clsx(styles.root, className)}>
            {(label || showValues || showPercentage) && (
                <div className={styles.header}>
                    {label ? <span className={styles.label}>{label}</span> : null}
                    <div className={styles.valueGroup}>
                        {showValues ? (
                            <span className={styles.value}>
                                {value}/{max}
                            </span>
                        ) : null}
                        {showPercentage ? (
                            <span className={styles.percentage}>{Math.round(percentage)}%</span>
                        ) : null}
                    </div>
                </div>
            )}

            <div className={styles.barWrapper}>
                <div className={styles.track}>
                    <div
                        className={clsx(styles.fill, animated && styles.animated)}
                        style={{ width: `${percentage}%` }}
                    >
                        <div className={styles.fillInner} />
                    </div>
                </div>
                <div
                    className={clsx(styles.glow, animated && styles.animated)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export { SpaceProgress };
