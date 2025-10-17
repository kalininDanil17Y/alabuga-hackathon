import React from "react";
import clsx from "clsx";
import styles from "./space-card.module.css";

type SpaceCardVariant = "default" | "gradient" | "glass" | "artefacts";

interface SpaceCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: SpaceCardVariant;
    glowing?: boolean;
    hoverable?: boolean;
}

const variantClasses: Record<SpaceCardVariant, string> = {
    default: styles.defaultVariant,
    gradient: styles.gradientVariant,
    glass: styles.glassVariant,
    artefacts: styles.artefactsVariant
};

const variantHoverClasses: Record<SpaceCardVariant, string> = {
    default: styles.hoverDefault,
    gradient: styles.hoverGradient,
    glass: styles.hoverGlass,
    artefacts: styles.hoverGlass
};

const SpaceCard: React.FC<SpaceCardProps> = ({
    children,
    className,
    variant = "default",
    glowing = false,
    hoverable = false,
}) => {
    const rootClassName = clsx(
        styles.base,
        variantClasses[variant],
        glowing && styles.glowing,
        hoverable && styles.hoverable,
        hoverable && variantHoverClasses[variant],
        className,
    );

    return (
        <div className={rootClassName}>
            {glowing ? <div className={styles.glowOverlay} aria-hidden="true" /> : null}
            <div className={styles.content}>{children}</div>
        </div>
    );
};

export { SpaceCard };
