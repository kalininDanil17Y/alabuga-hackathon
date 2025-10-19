import React from "react";
import clsx from "clsx";

import styles from "./dashboard-mission-card.module.css";
import { Button1 } from "@/components/ui/custom/button1.tsx";
import { CompetencyIcon } from "@/components/dashboard/missions/competency-icon";

import completeBg from "@/images/ui/mission-card/complete.svg";
import progressBg from "@/images/ui/mission-card/progress.svg";
import moderationBg from "@/images/ui/mission-card/moderation.svg";
import availableBg from "@/images/ui/mission-card/complete.svg";
import lockedBg from "@/images/ui/mission-card/locked.svg";

const STATUS_CONFIG = {
    complete: {
        label: "Завершено",
        color: "#1eff13",
        bgImage: completeBg,
    },
    progress: {
        label: "Выполняется",
        color: "#00c7ff",
        bgImage: progressBg,
    },
    moderation: {
        label: "На модерации",
        color: "#e1ff00",
        bgImage: moderationBg,
    },
    available: {
        label: "Доступно",
        color: "#ffffff",
        bgImage: availableBg,
    },
    locked: {
        label: "Заблокировано",
        color: "#9aa0a6",
        bgImage: lockedBg,
    },
} as const;

export type MissionStatus = "available" | "progress" | "moderation" | "complete" | "locked";

interface MissionStatusBadgeProps {
    status: MissionStatus;
    label?: string;
    className?: string;
}

export const MissionStatusBadge = ({ status, label, className }: MissionStatusBadgeProps) => {
    const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
    const displayLabel = label ?? statusConfig.label;

    return (
        <div className={clsx("w-[65px] h-[31px]", className)} aria-label={`Статус: ${displayLabel}`}>
            <img className="absolute w-full h-full top-0 left-0 object-contain" alt="" src={statusConfig.bgImage} />

            <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center">
                <span className="text-center text-[7px]" style={{ color: statusConfig.color }}>
                    {displayLabel}
                </span>
            </div>
        </div>
    );
};

export interface MissionProps {
    id: string;
    status: MissionStatus;
    title: string;
    mana?: number;
    exp?: number;
    competencies: Array<string | number>;
    completedDate?: string;
}

interface MissionCardProps extends MissionProps {
    onDetailsClick?: (id: string) => void;
    showDetailsButton?: boolean;
}

export const MissionCard = ({
    id,
    title,
    status,
    mana,
    exp,
    competencies,
    onDetailsClick,
    showDetailsButton = true,
}: MissionCardProps) => {
    const manaValue = mana ?? 0;
    const expValue = exp ?? 0;
    const competencyList = Array.isArray(competencies)
        ? Array.from(new Set(competencies.map((value) => String(value))))
        : [];
    const displayedCompetencies = competencyList.slice(0, 3);
    const hiddenCompetencies = competencyList.length - displayedCompetencies.length;
    const elementId = `mission-${id}`;

    return (
        <article className={styles.root} data-mission-id={id} id={elementId}>
            {showDetailsButton ? (
                <Button1 onClick={() => onDetailsClick?.(id)} className={styles.button} style={{ position: "absolute" }}>
                    Подробнее
                </Button1>
            ) : null}

            <h2 className={styles.title}>{title}</h2>

            <div className={styles.rewards}>
                <div className={styles.rewardItem}>
                    <span className={styles.rewardItemLabel}>Мана</span>

                    <div className="flex items-end gap-px relative self-stretch w-full flex-[0_0_auto]">
                        <span className="relative w-fit text-white whitespace-nowrap text-[7px]">{manaValue}</span>

                        <div
                            className="relative w-2 h-2 mr-[-1.00px] bg-[url(@/images/ui/mana.svg)] bg-[100%_100%]"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                <div className={styles.rewardItem}>
                    <span className={styles.rewardItemLabel}>Опыт</span>
                    <div className="flex items-end gap-px relative self-stretch w-full flex-[0_0_auto]">
                        <span className="relative w-fit mt-[-1.00px] text-white whitespace-nowrap text-[7px]">{expValue}</span>
                    </div>
                </div>

                <div className="inline-flex flex-col items-start gap-0.5 relative flex-[0_0_auto]">
                    <span className={styles.rewardItemLabel}>
                        Компетенции
                    </span>

                    <div className="flex items-center gap-0.5 relative self-stretch w-full flex-[0_0_auto]">
                        {displayedCompetencies.length === 0 ? (
                            <span className="text-[7px] text-white/70">—</span>
                        ) : (
                            <>
                                {displayedCompetencies.map((competencyId) => (
                                    <CompetencyIcon
                                        key={competencyId}
                                        competencyId={competencyId}
                                        size={16}
                                        className="relative"
                                    />
                                ))}
                                {hiddenCompetencies > 0 ? (
                                    <span className="text-[7px] text-white/80">+{hiddenCompetencies}</span>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <MissionStatusBadge status={status} className="absolute top-[-7px] right-[10%]" />
        </article>
    );
};
