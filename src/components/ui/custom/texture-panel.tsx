import * as React from "react";
import clsx from "clsx";
import styles from "./texture-panel.module.css";

export interface TexturePanelProps extends React.HTMLAttributes<HTMLDivElement> {
    contentClassName?: string;
    overlay?: boolean;
    overlayClassName?: string;
}

export const TexturePanel = React.forwardRef<HTMLDivElement, TexturePanelProps>(
    ({ className, style, contentClassName, children, overlay = false, overlayClassName, ...rest }, ref) => {
        return (
            <div ref={ref} className={clsx(styles.panel, className)} style={style} {...rest}>
                {overlay ? <div className={clsx(styles.overlay, overlayClassName)} aria-hidden /> : null}
                <div className={clsx(styles.content, contentClassName)}>{children}</div>
            </div>
        );
    },
);

TexturePanel.displayName = "TexturePanel";
