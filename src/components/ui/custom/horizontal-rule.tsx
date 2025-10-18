import React from "react";
import clsx from "clsx";
import styles from "./horizontal-rule.module.css";

interface HorizontalRuleProps extends React.HTMLAttributes<HTMLDivElement> {
    paddingX?: string;
    mirrored?: boolean;
    variant?: "default" | "v2";
}

const importers = {
    default: () => import("@/images/ui/horizontal-rule/custom_horizontal_rule.svg?react"),
    v2: () => import("@/images/ui/horizontal-rule/horizontal-rule-v2.svg?react"),
};

export function HorizontalRule({
                                   className,
                                   style,
                                   paddingX = "0px",
                                   mirrored,
                                   variant = "default",
                               }: HorizontalRuleProps) {
    const [Divider, setDivider] = React.useState<React.ComponentType<any> | null>(null);

    React.useEffect(() => {
        let mounted = true;
        importers[variant]()
            .then((mod) => {
                const Comp = (mod && (mod.default ?? (mod as any).ReactComponent)) as React.ComponentType<any>;
                if (mounted) setDivider(() => Comp);
            })
            .catch((err) => {
                console.error("Failed to load divider:", err);
                if (mounted) setDivider(() => null);
            });
        return () => {
            mounted = false;
        };
    }, [variant]);

    const dynamicStyle: React.CSSProperties = {
        width: `calc(100% + (${paddingX} * 2))`,
        marginLeft: `calc(-1 * ${paddingX})`,
        ...style,
    };

    return (
        <div className={clsx(styles.root, className)} style={dynamicStyle} data-mirrored={mirrored ? "true" : "false"}>
            {Divider ? (
                <Divider className={clsx(styles.divider, mirrored && styles.verticalMirror)} />
            ) : (
                <div style={{ height: "100%", width: "100%" }} />
            )}
        </div>
    );
}
