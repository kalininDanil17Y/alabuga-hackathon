import React from "react";
import clsx from "clsx";
import styles from "./button1.module.css";

interface Button1Props extends React.HTMLAttributes<HTMLButtonElement> {
    height?: string;
    width?: string;
}

export function Button1 ({ onClick, children, height, width }: Button1Props) {

    const dynamicStyle: React.CSSProperties = {};

    if (height) {
        dynamicStyle.height = height;
    }

    if (width) {
        dynamicStyle.width = width;
    }

    return (
        <button
            className={clsx(styles.button1, dynamicStyle)}
            onClick={onClick}
        >
            {children}
        </button>
    );
}