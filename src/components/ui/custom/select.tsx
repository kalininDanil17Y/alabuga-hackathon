import React from "react";
import clsx from "clsx";
import styles from "./select.module.css";

interface OptionType {
    label: string;
    value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    items: OptionType[];
    allElem?: OptionType;
}

export function Select({ items, allElem, className, onChange, ...props }: SelectProps) {
    return (
        <select className={clsx(styles.root, className)} onChange={onChange} {...props}>
            {allElem ? <option value={allElem.value}>{allElem.label}</option> : null}
            {items.map((item) => (
                <option value={item.value} key={item.value}>
                    {item.label}
                </option>
            ))}
        </select>
    );
}
