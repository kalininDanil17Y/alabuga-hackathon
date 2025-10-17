import React from "react";
import clsx from "clsx";
import styles from "./button1.module.css";

interface Button1Props extends React.HTMLAttributes<HTMLButtonElement> {}

export function Button1 ({ onClick, children, className, ...props }: Button1Props) {

    return (
        <button
            className={clsx(className, styles.button1)}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}