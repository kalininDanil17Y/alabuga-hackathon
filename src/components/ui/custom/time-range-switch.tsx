import React from "react";
import clsx from "clsx";
import styles from "./time-range-switch.module.css";

interface TimeRangeOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface TimeRangeSwitchProps {
    options: TimeRangeOption[];
    value: string;
    onChange?: (value: string) => void;
    label?: string;
    className?: string;
}

export function TimeRangeSwitch({ options, value, onChange, label, className }: TimeRangeSwitchProps) {
    const handleSelect = (nextValue: string, isDisabled?: boolean) => {
        if (isDisabled || nextValue === value) {
            return;
        }

        onChange?.(nextValue);
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLButtonElement>,
        currentIndex: number,
        isDisabled?: boolean,
    ) => {
        if (isDisabled) {
            return;
        }

        const lastIndex = options.length - 1;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            const nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
            const nextOption = options[nextIndex];
            if (!nextOption?.disabled) {
                onChange?.(nextOption.value);
            }
            return;
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            const prevIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
            const prevOption = options[prevIndex];
            if (!prevOption?.disabled) {
                onChange?.(prevOption.value);
            }
            return;
        }

        if (event.key === "Home") {
            event.preventDefault();
            const firstAvailable = options.find((option) => !option.disabled);
            if (firstAvailable) {
                onChange?.(firstAvailable.value);
            }
            return;
        }

        if (event.key === "End") {
            event.preventDefault();
            const reversed = [...options].reverse();
            const lastAvailable = reversed.find((option) => !option.disabled);
            if (lastAvailable) {
                onChange?.(lastAvailable.value);
            }
        }
    };

    return (
        <div className={clsx(styles.root, className)}>
            {label ? <span className={styles.label}>{label}</span> : null}

            <div className={styles.group} role="radiogroup" aria-label={label ?? "Выбор периода"}>
                {options.map((option, index) => {
                    const isActive = option.value === value;
                    const isDisabled = option.disabled ?? false;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            aria-disabled={isDisabled}
                            className={styles.option}
                            data-active={isActive ? "true" : "false"}
                            data-disabled={isDisabled ? "true" : "false"}
                            onClick={() => handleSelect(option.value, isDisabled)}
                            onKeyDown={(event) => handleKeyDown(event, index, isDisabled)}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export type { TimeRangeOption };
