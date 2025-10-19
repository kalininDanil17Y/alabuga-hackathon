import { useEffect, useMemo, useRef, useState, useId, type PointerEvent } from "react";
import clsx from "clsx";

import styles from "./competency-icon.module.css";
import { useDashboardStore } from "@/store/dashboardStore";

type CompetencyIconProps = {
    competencyId: string | number;
    className?: string;
    size?: number;
};

const TOUCH_TOOLTIP_HIDE_TIMEOUT = 2500;

export const CompetencyIcon = ({ competencyId, className, size = 20 }: CompetencyIconProps) => {
    const normalizedId = String(competencyId);
    const tooltipId = useId();

    const { competencies, missionFilterOptions } = useDashboardStore((state) => ({
        competencies: state.competencies,
        missionFilterOptions: state.missionFilterOptions,
    }));

    const label = useMemo(() => {
        const competencyMatch = competencies.find((item) => String(item.id) === normalizedId);
        if (competencyMatch) {
            return competencyMatch.title;
        }

        const optionMatch = missionFilterOptions.find((option) => option.value === normalizedId);
        if (optionMatch) {
            return optionMatch.label;
        }

        return `Компетенция ${normalizedId}`;
    }, [competencies, missionFilterOptions, normalizedId]);

    const [isTooltipVisible, setTooltipVisible] = useState(false);
    const touchTimerRef = useRef<number | null>(null);
    const touchActiveRef = useRef(false);

    const clearTouchTimer = () => {
        if (touchTimerRef.current) {
            window.clearTimeout(touchTimerRef.current);
            touchTimerRef.current = null;
        }
    };

    const showTooltip = () => {
        clearTouchTimer();
        setTooltipVisible(true);
    };

    const hideTooltip = () => {
        clearTouchTimer();
        setTooltipVisible(false);
        touchActiveRef.current = false;
    };

    useEffect(() => () => clearTouchTimer(), []);

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== "touch") {
            return;
        }

        event.preventDefault();

        if (touchActiveRef.current) {
            hideTooltip();
            return;
        }

        touchActiveRef.current = true;
        showTooltip();
        touchTimerRef.current = window.setTimeout(() => {
            hideTooltip();
        }, TOUCH_TOOLTIP_HIDE_TIMEOUT);
    };

    const isNumericId = /^\d+$/.test(normalizedId);
    const iconSrc = isNumericId ? `/images/competencies/c${normalizedId}.svg` : null;

    return (
        <div
            className={clsx(styles.root, className)}
            style={{ width: size, height: size }}
            tabIndex={0}
            role="img"
            aria-label={label}
            aria-describedby={isTooltipVisible ? tooltipId : undefined}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            onPointerDown={handlePointerDown}
            onPointerLeave={(event) => {
                if (event.pointerType !== "touch") {
                    hideTooltip();
                }
            }}
        >
            {iconSrc ? (
                <img src={iconSrc} alt="" className={styles.icon} aria-hidden="true" loading="lazy" />
            ) : (
                <span className={styles.fallback} aria-hidden="true">
                    {normalizedId.charAt(0).toUpperCase()}
                </span>
            )}

            <div
                id={tooltipId}
                role="tooltip"
                className={clsx(styles.tooltip, isTooltipVisible && styles.tooltipVisible)}
            >
                {label}
            </div>
        </div>
    );
};
