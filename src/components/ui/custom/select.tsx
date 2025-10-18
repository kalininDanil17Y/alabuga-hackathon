import React from "react";
import clsx from "clsx";
import styles from "./select.module.css";

interface OptionType {
    label: string;
    value: string;
    disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    items: OptionType[];
    allElem?: OptionType;
}

export function Select({ items, allElem, className, onChange, ...props }: SelectProps) {
    return (
        <select className={clsx(styles.root, className)} onChange={onChange} {...props}>
            {allElem ? <option value={allElem.value} disabled={allElem.disabled ?? false}>{allElem.label}</option> : null}
            {items.map((item) => {
                const isDisabled = item.disabled ?? false;

                return (
                    <option
                        value={item.value}
                        key={item.value}
                        aria-disabled={isDisabled}
                        data-disabled={isDisabled ? "true" : "false"}
                        disabled={isDisabled}
                    >
                        {item.label}
                    </option>
                );
            })}
        </select>
    );
}
