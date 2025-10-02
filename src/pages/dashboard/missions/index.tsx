import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useSearchParams } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { TexturePanel } from "@/components/ui/custom/texture-panel";
import { useDashboardStore } from "@/store/dashboardStore";
import type { MissionStatus } from "@/types/missions";
import styles from "./DashboardMissions.module.css";

type FilterKey = "status" | "competencyId";

const statusOrder: MissionStatus[] = ["available", "in_progress", "moderation", "completed", "locked"];

const MissionsPage = () => {
    const {
        missionsEntries,
        missionStatusLabels,
        missionFilterOptions,
        missionsFilters,
        fetchMissionsPage,
        isMissionsLoading,
        missionsError,
        setMissionsFilters,
    } = useDashboardStore((state) => ({
        missionsEntries: state.missionsEntries,
        missionStatusLabels: state.missionStatusLabels,
        missionFilterOptions: state.missionFilterOptions,
        missionsFilters: state.missionsFilters,
        fetchMissionsPage: state.fetchMissionsPage,
        isMissionsLoading: state.isMissionsLoading,
        missionsError: state.missionsError,
        setMissionsFilters: state.setMissionsFilters,
    }));

    const [searchParams] = useSearchParams();
    const missionIdParam = searchParams.get("missionId");
    const competencyIdParam = searchParams.get("competencyId");
    const missionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [focusedMissionId, setFocusedMissionId] = useState<string | null>(null);

    const setMissionRef = useCallback(
        (missionId: string) => (node: HTMLDivElement | null) => {
            missionRefs.current[missionId] = node;
        },
        [],
    );

    useEffect(() => {
        void fetchMissionsPage();
    }, [fetchMissionsPage]);

    useEffect(() => {
        if (!missionIdParam) {
            setFocusedMissionId(null);
            return;
        }

        if (missionsEntries.length === 0) {
            return;
        }

        const targetEntry = missionsEntries.find(
            (entry) => entry.id === missionIdParam || entry.tasks.some((task) => task.id === missionIdParam),
        );

        if (!targetEntry) {
            setFocusedMissionId(null);
            return;
        }

        setFocusedMissionId(targetEntry.id);

        const targetCompetency = competencyIdParam ?? targetEntry.competencyId ?? "all";
        if (targetCompetency && missionsFilters.competencyId !== targetCompetency) {
            setMissionsFilters({ competencyId: targetCompetency });
        }

        if (missionsFilters.status !== "all" && missionsFilters.status !== targetEntry.status) {
            setMissionsFilters({ status: "all" });
        }
    }, [
        missionIdParam,
        competencyIdParam,
        missionsEntries,
        missionsFilters.competencyId,
        missionsFilters.status,
        setMissionsFilters,
    ]);

    const missionStatusOptions = useMemo(
        () => [{ value: "all", label: "Все статусы" }, ...statusOrder.map((status) => ({ value: status, label: missionStatusLabels[status] }))],
        [missionStatusLabels],
    );

    const filteredEntries = useMemo(() => {
        return missionsEntries.filter((entry) => {
            const matchesStatus =
                missionsFilters.status === "all" || entry.status === missionsFilters.status;
            const matchesCompetency =
                missionsFilters.competencyId === "all" || entry.competencyId === missionsFilters.competencyId;
            return matchesStatus && matchesCompetency;
        });
    }, [missionsEntries, missionsFilters]);

    useEffect(() => {
        if (!focusedMissionId) {
            return;
        }

        const isRendered = filteredEntries.some((entry) => entry.id === focusedMissionId);
        if (!isRendered) {
            return;
        }

        const panel = missionRefs.current[focusedMissionId];
        if (!panel) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            panel.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [focusedMissionId, filteredEntries]);

    const handleFilterChange = (key: FilterKey, value: string) => {
        if (key === "status") {
            setMissionsFilters({ status: value as MissionStatus | "all" });
            return;
        }

        setMissionsFilters({ competencyId: value });
    };

    if (isMissionsLoading && missionsEntries.length === 0) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                Подгружаем миссии...
            </SpaceCard>
        );
    }

    if (missionsError) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <div className={styles.stateContent}>
                    <p>{missionsError}</p>
                    <SpaceButton variant="outline" onClick={() => fetchMissionsPage(true)}>
                        Повторить попытку
                    </SpaceButton>
                </div>
            </SpaceCard>
        );
    }

    return (
        <div className={styles.root}>
            <SpaceCard variant="glass" className={styles.filterCard}>
                <div className={styles.filters}>
                    <label className={styles.filterField}>
                        <span className={styles.filterLabel}>Статус</span>
                        <select
                            className={styles.select}
                            value={missionsFilters.status}
                            onChange={(event) => handleFilterChange("status", event.target.value)}
                        >
                            {missionStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.filterField}>
                        <span className={styles.filterLabel}>Компетенция</span>
                        <select
                            className={styles.select}
                            value={missionsFilters.competencyId}
                            onChange={(event) => handleFilterChange("competencyId", event.target.value)}
                        >
                            {missionFilterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </SpaceCard>

            <section className={styles.missionsGrid}>
                {filteredEntries.length === 0 ? (
                    <SpaceCard variant="glass" className={styles.stateCard}>
                        Миссии по выбранным фильтрам не найдены.
                    </SpaceCard>
                ) : (
                    filteredEntries.map((entry) => (
                        <TexturePanel
                            key={entry.id}
                            ref={setMissionRef(entry.id)}
                            className={clsx(
                                styles.missionPanel,
                                focusedMissionId === entry.id && styles.missionPanelFocused,
                            )}
                            contentClassName={styles.missionContent}
                            overlay
                            style={{ scrollMarginTop: "96px" }}
                        >
                            <div className={styles.missionHeader}>
                                <div>
                                    <h3 className={styles.missionTitle}>{entry.title}</h3>
                                    {entry.description ? (
                                        <p className={styles.missionDescription}>{entry.description}</p>
                                    ) : null}
                                </div>
                                <span className={clsx(styles.statusBadge, styles[`status${entry.status}`])}>
                                    {missionStatusLabels[entry.status] ?? entry.status}
                                </span>
                            </div>
                            <div className={styles.tasks}>
                                {entry.tasks.map((task) => {
                                    const progressWidth = Math.min(task.progress, 100);
                                    return (
                                        <div key={task.id} className={styles.taskRow}>
                                            <div>
                                                <p className={styles.taskTitle}>{task.title}</p>
                                                {task.reward?.xp ? (
                                                    <span className={styles.taskReward}>+{task.reward.xp} XP</span>
                                                ) : null}
                                            </div>
                                            <div className={styles.taskProgress}>
                                                <div className={styles.progressTrack}>
                                                    <div
                                                        className={clsx(styles.progressFill, styles[`progress${task.status}`])}
                                                        style={{ width: `${progressWidth}%` }}
                                                    />
                                                </div>
                                                <span className={styles.taskStatus}>{missionStatusLabels[task.status]}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </TexturePanel>
                    ))
                )}
            </section>
        </div>
    );
};

export default MissionsPage;
