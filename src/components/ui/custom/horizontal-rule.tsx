import clsx from "clsx";
import styles from "./horizontal-rule.module.css";
import React from "react";
import Divider from "@/images/ui/horizontal-rule/custom_horizontal_rule.svg?react";

interface HorizontalRuleProps extends React.HTMLAttributes<HTMLDivElement> {
    paddingX?: string;
    mirrored?: boolean;
}

export function HorizontalRule({ className, style, paddingX = "0px", mirrored }: HorizontalRuleProps) {
    const dynamicStyle: React.CSSProperties = {
        width: `calc(100% + (${paddingX} * 2))`,
        marginLeft: `calc(-1 * ${paddingX})`,
        ...style,
    };

    return (
        <div className={clsx(styles.root, className)} style={dynamicStyle} data-mirrored={mirrored ? "true" : "false"}>
            <Divider className={clsx(styles.divider, mirrored && styles.verticalMirror)} />
        </div>
    );
}
