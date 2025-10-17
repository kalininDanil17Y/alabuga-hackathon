import React from "react";
import styles from "./select.module.css";

interface OptionType {
    label: string;
    value: string;
}

interface SelectProps extends React.HTMLAttributes<HTMLSelectElement> {
    items: OptionType[],
    allElem?: OptionType,
    onChange?: React.ChangeEventHandler<HTMLSelectElement>,
}

export function Select ({ items, allElem, onChange }: SelectProps) {

    return (
        <select className={styles.root} onChange={onChange}>
            { allElem ? <option value={allElem.value}>{allElem.label}</option> : null }
            {items.map(item => (
                <option value={item.value} key={item.value}>{item.label}</option>
            ))}
        </select>
    );
}