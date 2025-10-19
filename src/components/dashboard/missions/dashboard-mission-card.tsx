import React from "react";

import styles from "./dashboard-mission-card.module.css";
import { Button1 } from "@/components/ui/custom/button1.tsx";

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

export interface MissionProps {
    id: string;
    status: MissionStatus;
    title: string;
    mana?: number;
    exp?: number;
    competencies: string[];
}

interface MissionCardProps extends MissionProps {
    onDetailsClick?: (id: string) => void;
}

export const MissionCard = ({
    id,
    title,
    status,
    mana,
    exp,
    onDetailsClick,
}: MissionCardProps) => {
    const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
    const manaValue = mana ?? 0;
    const expValue = exp ?? 0;

    return (
        <article className={styles.root} data-mission-id={id}>
            <Button1 onClick={() => onDetailsClick?.(id)} className={styles.button} style={{ position: "absolute" }}>
                Подробнее
            </Button1>

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
            </div>

            <div className="absolute top-[-7px] right-[10%] w-[65px] h-[31px]" aria-label={`Статус: ${statusConfig.label}`}>
                <img className="absolute w-full h-full top-0 left-0 object-contain" alt="" src={statusConfig.bgImage} />

                <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center">
                    <span className="text-center text-[7px]" style={{ color: statusConfig.color }}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>
        </article>
    );
};
