import React from "react";
import clsx from "clsx";
import styles from "./button2.module.css";

type Button2Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

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