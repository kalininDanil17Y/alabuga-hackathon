import React from "react";
import clsx from "clsx";
import styles from "./button2.module.css";

interface Button2Props extends React.HTMLAttributes<HTMLButtonElement> {}

export function Button2 ({ onClick, children, className, ...props }: Button2Props) {

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