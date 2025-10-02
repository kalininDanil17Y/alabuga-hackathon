import React from "react";
import clsx from "clsx";
import styles from "./space-button.module.css";

interface SpaceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "icon";
    size?: "sm" | "md" | "lg";
    glowing?: boolean;
    children: React.ReactNode;
}

const sizeClassMap: Record<NonNullable<SpaceButtonProps["size"]>, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
};

const iconSizeClassMap: Record<NonNullable<SpaceButtonProps["size"]>, string> = {
    sm: styles.iconSizeSm,
    md: styles.iconSizeMd,
    lg: styles.iconSizeLg,
};

const SpaceButton = React.forwardRef<HTMLButtonElement, SpaceButtonProps>(
    ({ className, variant = "primary", size = "md", glowing = false, children, ...props }, ref) => {
        const isIcon = variant === "icon";

        const buttonClassName = clsx(
            styles.base, 'group',
            !isIcon && styles.nonIcon,
            isIcon ? styles.iconBase : sizeClassMap[size],
            isIcon && iconSizeClassMap[size],
            !isIcon && styles[variant],
            glowing && !isIcon && styles.glowing,
            className,
        );

        return (
            <button className={buttonClassName} ref={ref} {...props}>
                {glowing && !isIcon ? <div className={styles.glowOverlay} aria-hidden="true" /> : null}
                {isIcon ? children : <span className={styles.content}>{children}</span>}
            </button>
        );
    },
);

SpaceButton.displayName = "SpaceButton";

export { SpaceButton };

