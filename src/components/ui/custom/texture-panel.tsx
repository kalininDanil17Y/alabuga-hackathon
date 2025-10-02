import * as React from "react";
import { cn } from "@/lib/utils";
import "./texture-panel.css";

export interface TexturePanelProps
    extends React.HTMLAttributes<HTMLDivElement> {
    contentClassName?: string;
    topSrc?: string;
    middleSrc?: string;
    bottomSrc?: string;
    topHeight?: number;
    bottomHeight?: number;
    overlay?: boolean;
    overlayClassName?: string;
}

export const TexturePanel = React.forwardRef<HTMLDivElement, TexturePanelProps>(
    (
        {
            className,
            style,
            contentClassName,
            children,
            overlay = false,
            overlayClassName,
            ...rest
        },
        ref,
    ) => {
        return (
            <div
                ref={ref}
                className={cn("texture-panel", className)}
                style={style}
                {...rest}
            >
                {overlay ? (
                    <div
                        className={cn("texture-panel__overlay", overlayClassName)}
                        aria-hidden
                    />
                ) : null}
                <div className={cn("texture-panel__content", contentClassName)}>
                    {children}
                </div>
            </div>
        );
    },
);

TexturePanel.displayName = "TexturePanel";
