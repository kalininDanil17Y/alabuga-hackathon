import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./mission-details-modal.module.css";
import ManaIcon from "@/images/ui/mana.svg?react";
import {
    MissionStatusBadge,
    type MissionStatus,
} from "@/components/dashboard/missions/dashboard-mission-card";
import {Button2} from "@/components/ui/custom/button2.tsx";
import { CompetencyIcon } from "@/components/dashboard/missions/competency-icon";

export type MissionDetailViewModel = {
    id: string;
    title: string;
    entryTitle: string;
    description?: string;
    statusLabel: string;
    status: MissionStatus;
    mana: number;
    exp: number;
    artifactCount: number;
    artifactItems: string[];
    competencies: Array<string | number>;
};

interface MissionDetailsModalProps {
    open: boolean;
    onClose: () => void;
    mission: MissionDetailViewModel | null;
    onAction?: () => void;
    actionLabel?: string;
    actionDisabled?: boolean;
}

const MissionDetailsModal = ({ open, onClose, mission, onAction, actionLabel, actionDisabled }: MissionDetailsModalProps) => {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open || !mission) {
        return null;
    }

    if (typeof document === "undefined") {
        return null;
    }

    const {
        title,
        description,
        statusLabel,
        status,
        mana,
        exp,
        artifactItems,
        competencies
    } = mission;

    const shouldRenderAction = status !== "complete" && typeof onAction === "function";


    const manaValue = mana > 0 ? `+${mana}` : "—";
    const expValue = exp > 0 ? `+${exp}` : "—";

    const competencyIcons = competencies.slice(0, 6);
    const extraCompetencies = competencies.length - competencyIcons.length;

    const modalContent = (
        <div className={styles.root} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
            <div className={styles.card} onClick={(event) => event.stopPropagation()}>
                {/*<button className={styles.closeButton} type="button" aria-label="Закрыть" onClick={onClose}>
                    ×
                </button>*/}

                <div className={styles.header}>
                    <div className={styles.titleBlock}>
                        <h2 className={styles.title}>{title}</h2>
                        {/*<span className={styles.entryTitle}>{entryTitle}</span>*/}
                    </div>
                    <MissionStatusBadge status={status} label={statusLabel} className={styles.statusBadge} />
                </div>

                <div className={styles.descriptionBlock}>
                    {description ? <p className={styles.description}>{description}</p> : null}
                </div>

                <div className={styles.rewards}>
                    {artifactItems.length > 0 && (
                        <>
                            <div className={styles.rewardCard}>
                                <span className={styles.rewardLabel}>Артефакты</span>
                                <span className={styles.rewardValue}>
                                    <img src={"/images/artefacts/art" + artifactItems[0] + ".svg"} alt={artifactItems[0]} loading="lazy" />
                                </span>
                            </div>
                            <div className={styles.rewardDivider}></div>
                        </>
                    )}

                    <div className={styles.rewardCard}>
                        <span className={styles.rewardLabel}>Мана</span>
                        <span className={styles.rewardValue}>
                            {manaValue}
                            {mana > 0 ? <ManaIcon width="10px" height="10px"/> : null}
                        </span>
                    </div>
                    <div className={styles.rewardDivider}></div>
                    <div className={styles.rewardCard}>
                        <span className={styles.rewardLabel}>Опыт</span>
                        <span className={styles.rewardValue}>{expValue}</span>
                    </div>
                    <div className={styles.rewardDivider}></div>
                    <div className={styles.rewardCard}>
                        <span className={styles.rewardLabel}>Компетенции</span>
                        <span className={styles.rewardValue}>
                            <div className={styles.competenciesList}>
                                {competencyIcons.map((competency) => (
                                    <CompetencyIcon
                                        key={competency}
                                        competencyId={competency}
                                        size={20}
                                        className={styles.competencyIcon}
                                    />
                                ))}
                                {extraCompetencies > 0 ? <span>+{extraCompetencies}</span> : null}
                            </div>
                        </span>
                    </div>
                </div>

                {shouldRenderAction ? (
                    <div className={styles.footer}>
                        <Button2 className={"w-[200px] h-[35px]"} onClick={onAction} disabled={actionDisabled}>
                            {actionLabel ?? "принять"}
                        </Button2>
                    </div>
                ) : null}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default MissionDetailsModal;
