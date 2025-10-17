import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { useDashboardStore } from "@/store/dashboardStore";
import type { MissionStatus } from "@/types/missions";
import styles from "./DashboardMissions.module.css";
import {Select} from "@/components/ui/custom/select.tsx";
import { MissionCollapse } from "@/components/dashboard/missions/dashboard-misssion-collapse.tsx";
import {MissionProps} from "@/components/dashboard/missions/dashboard-mission-card.tsx";

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
    const missionTaskRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [focusedMissionId, setFocusedMissionId] = useState<string | null>(null);
    const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
    const syncedFilterKeyRef = useRef<string | null>(null);

    const setMissionRef = useCallback(
        (missionId: string) => (node: HTMLDivElement | null) => {
            missionRefs.current[missionId] = node;
        },
        [],
    );

    const setMissionTaskRef = useCallback(
        (taskId: string) => (node: HTMLDivElement | null) => {
            missionTaskRefs.current[taskId] = node;
        },
        [],
    );

    useEffect(() => {
        void fetchMissionsPage();
    }, [fetchMissionsPage]);

    useEffect(() => {
        if (!missionIdParam) {
            setFocusedMissionId(null);
            setFocusedTaskId(null);
            syncedFilterKeyRef.current = null;
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
            setFocusedTaskId(null);
            syncedFilterKeyRef.current = null;
            return;
        }

        setFocusedMissionId(targetEntry.id);

        const matchedTask = targetEntry.tasks.find((task) => task.id === missionIdParam);
        setFocusedTaskId(matchedTask?.id ?? null);

        const targetCompetency = competencyIdParam ?? targetEntry.competencyId ?? "all";
        const canApplyCompetency =
            targetCompetency === "all" || missionFilterOptions.some((option) => option.value === targetCompetency);
        const syncKey = `${missionIdParam}-${targetCompetency}`;

        if (!canApplyCompetency) {
            syncedFilterKeyRef.current = null;
            return;
        }

        if (
            missionsFilters.competencyId !== targetCompetency &&
            syncedFilterKeyRef.current !== syncKey
        ) {
            setMissionsFilters({ competencyId: typeof targetCompetency === "string" ? parseInt(targetCompetency, 10) : targetCompetency });
            syncedFilterKeyRef.current = syncKey;
            return;
        }

        if (syncedFilterKeyRef.current !== syncKey) {
            syncedFilterKeyRef.current = syncKey;
        }
    }, [
        missionIdParam,
        competencyIdParam,
        missionsEntries,
        missionFilterOptions,
        missionsFilters.competencyId,
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

        const entry = filteredEntries.find((item) => item.id === focusedMissionId);
        if (!entry) {
            return;
        }

        const panel = missionRefs.current[focusedMissionId];
        const taskNode = focusedTaskId ? missionTaskRefs.current[focusedTaskId] : null;
        const target = taskNode ?? panel;

        if (!target) {
            return;
        }

        let frameOne: number | null = null;
        let frameTwo: number | null = null;

        frameOne = window.requestAnimationFrame(() => {
            frameTwo = window.requestAnimationFrame(() => {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        });

        return () => {
            if (frameOne !== null) {
                window.cancelAnimationFrame(frameOne);
            }
            if (frameTwo !== null) {
                window.cancelAnimationFrame(frameTwo);
            }
        };
    }, [focusedMissionId, focusedTaskId, filteredEntries]);

    const handleFilterChange = (key: FilterKey, value: string) => {
        if (key === "status") {
            setMissionsFilters({ status: value as MissionStatus | "all" });
            return;
        }

        syncedFilterKeyRef.current = null;
        setMissionsFilters({ competencyId: parseInt(value, 10) });
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

    const items: MissionProps[] = [
        {
            id: 1,
            title: "Миссия 1",
            status: "complete",
            mana: 1960,
            exp: 1960,
            competencies: [1, 2],
        },
        {
            id: 2,
            title: "Миссия 2",
            status: "moderation",
            mana: 1960,
            exp: 1960,
            competencies: [1, 2],
        },
        {
            id: 2,
            title: "Миссия 3",
            status: "progress",
            mana: 1960,
            exp: 1960,
            competencies: [1, 2],
        }
    ];

    return (
        <div className={styles.root}>
            <div className={styles.filters}>
                <Select items={missionStatusOptions} onChange={(event) => handleFilterChange("status", event.target.value)} />
                <Select items={missionFilterOptions} onChange={(event) => handleFilterChange("competencyId", event.target.value)} />
            </div>

            <MissionCollapse items={items} title="Test"/>

            {/*<section className={styles.missionsGrid}>
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
                                        <div
                                            key={task.id}
                                            ref={setMissionTaskRef(task.id)}
                                            className={clsx(
                                                styles.taskRow,
                                                focusedTaskId === task.id && styles.missionTaskFocused,
                                            )}
                                            style={{ scrollMarginTop: "96px" }}
                                        >
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
            </section>*/}
        </div>
    );
};

export default MissionsPage;
