import React from "react";
import { cn } from "@/lib/utils";

interface SpaceButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "icon";
    size?: "sm" | "md" | "lg";
    glowing?: boolean;
    children: React.ReactNode;
}

const SpaceButton = React.forwardRef<HTMLButtonElement, SpaceButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            glowing = false,
            children,
            ...props
        },
        ref,
    ) => {
        const isIcon = variant === "icon";

        return (
            <button
                className={cn(
                    "relative group transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-space-cyan-300",
                    !isIcon && "font-semibold tracking-wider",
                    !isIcon && {
                        "px-4 py-2 text-sm": size === "sm",
                        "px-6 py-3 text-base": size === "md",
                        "px-8 py-4 text-lg": size === "lg",
                    },
                    !isIcon && {
                        "bg-gradient-to-r from-space-cyan-400 to-space-blue-600 text-white border border-space-cyan-300 hover:border-space-cyan-400":
                            variant === "primary",
                        "bg-space-blue-700 text-white border border-space-blue-600 hover:border-space-blue-500":
                            variant === "secondary",
                        "bg-transparent text-white border border-white/20 hover:border-white/40":
                            variant === "outline",
                    },
                    isIcon && [
                        "flex items-center justify-center p-0 text-space-cyan-200 hover:text-white bg-transparent border-none focus:ring-offset-0",
                        {
                            "h-8 w-8": size === "sm",
                            "h-10 w-10": size === "md",
                            "h-12 w-12": size === "lg",
                        },
                    ],
                    !isIcon &&
                    glowing &&
                    variant === "primary" && [
                        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-space-cyan-400 before:to-space-blue-600 before:rounded-lg before:blur-sm before:group-hover:blur-md before:transition-all before:duration-300 before:-z-10",
                    ],
                    className,
                )}
                ref={ref}
                {...props}
            >
                {!isIcon && glowing && variant === "primary" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-space-cyan-400 to-space-blue-600 rounded-lg blur-sm group-hover:blur-md transition-all duration-300 -z-10"></div>
                )}
                {isIcon ? children : <span className="relative z-10">{children}</span>}
            </button>
        );
    },
);

SpaceButton.displayName = "SpaceButton";

export { SpaceButton };
