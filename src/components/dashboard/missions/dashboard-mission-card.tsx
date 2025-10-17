import React from "react";

import styles from "./dashboard-mission-card.module.css";
import {Button1} from "@/components/ui/custom/button1.tsx";

import completeBg from "@/images/ui/mission-card/complete.svg";
import progressBg from "@/images/ui/mission-card/progress.svg";
import moderationBg from "@/images/ui/mission-card/moderation.svg";
import available from "@/images/ui/mission-card/complete.svg";

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
        bgImage: available,
    },
};

export type MissionStatus = "pending" | "progress" | "moderation" | "complete";

export interface MissionProps {
    id: number;
    status: MissionStatus,
    title: string,
    mana?: number,
    exp?: number;
    competencies: number[]
}

interface MissionCardProps extends MissionProps {
    onDetailsClick?: (id: number) => void,
}

export const MissionCard = ({
                                id,
                                title,
                                status,
                                mana,
                                exp,
                                onDetailsClick,
                            }: MissionCardProps) => {
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.available;

    return (
        <article className="relative w-[90%] h-14 bg-[#0d237899] border border-solid border-[#203daf] overflow-hidden">

            <Button1 onClick={() => onDetailsClick?.(id)} className="top-6 right-[8%] w-[76px] h-[21px]" style={{position: 'absolute'}}>
                Подробнее
            </Button1>

            <h2 className="absolute top-1.5 left-[3%] w-52 text-[9px] text-white">
                {title}
            </h2>

            <div className="inline-flex items-center gap-2 absolute bottom-[7px] left-[5px]">
                <div className="flex flex-col w-8 items-start gap-0.5 relative">
                    <span className="relative self-stretch mt-[-1.00px] text-[7px]">
                        Мана
                    </span>

                    <div className="flex items-end gap-px relative self-stretch w-full flex-[0_0_auto]">
                        <span className="relative w-fit text-white whitespace-nowrap text-[7px]">
                          {mana}
                        </span>

                        <div
                            className="relative w-2 h-2 mr-[-1.00px] bg-[url(@/images/ui/mana.svg)] bg-[100%_100%]"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                <div className="flex flex-col w-8 items-start gap-0.5 relative">
                    <span className="relative self-stretch mt-[-1.00px] text-[7px]">
                        Опыт
                    </span>
                    <div className="flex items-end gap-px relative self-stretch w-full flex-[0_0_auto]">
                        <span className="relative w-fit mt-[-1.00px] text-white whitespace-nowrap text-[7px]">
                          {exp}
                        </span>
                    </div>
                </div>
            </div>

            <div
                className="absolute top-[-7px] right-[10%] w-[65px] h-[31px]"
                aria-label={`Статус: ${statusConfig.label}`}
            >
                <img
                    className="absolute w-full h-full top-0 left-0 object-contain"
                    alt=""
                    src={statusConfig.bgImage}
                />

                <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center">
                    <span
                        className="text-center text-[7px]"
                        style={{ color: statusConfig.color }}
                    >
                        {statusConfig.label}
                    </span>
                </div>
            </div>
        </article>
    );
};
