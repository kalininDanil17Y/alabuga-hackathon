import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { useDashboardStore } from "@/store/dashboardStore";
import type { MissionEntry, MissionStatus as EntryMissionStatus } from "@/types/missions";
import styles from "./DashboardMissions.module.css";
import { Select } from "@/components/ui/custom/select.tsx";
import { MissionCollapse } from "@/components/dashboard/missions/dashboard-misssion-collapse.tsx";
import type { MissionProps, MissionStatus as CardMissionStatus } from "@/components/dashboard/missions/dashboard-mission-card";

type FilterKey = "status" | "competencyId";

const statusOrder: EntryMissionStatus[] = ["available", "in_progress", "moderation", "completed", "locked"];

const missionStatusMap: Record<EntryMissionStatus, CardMissionStatus> = {
    available: "available",
    in_progress: "progress",
    moderation: "moderation",
    completed: "complete",
    locked: "locked",
};

const toMissionCards = (entry: MissionEntry): MissionProps[] => {
    return entry.tasks.map((task) => {
        const competencies = [task.competencyId ?? entry.competencyId]
            .filter((value): value is string | number => value !== undefined && value !== null)
            .map((value) => String(value));

        const rewardXp = task.reward?.xp ?? 0;
        const rewardCurrency = task.reward?.currency ?? rewardXp;

        return {
            id: task.id,
            title: task.title,
            status: missionStatusMap[task.status] ?? "available",
            mana: rewardCurrency,
            exp: rewardXp,
            competencies,
        };
    });
};

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

    const [searchParams, setSearchParams] = useSearchParams();
    const missionIdParam = searchParams.get("missionId");
    const competencyIdParam = searchParams.get("competencyId");

    useEffect(() => {
        void fetchMissionsPage(true);
    }, [fetchMissionsPage]);

    useEffect(() => {
        if (competencyIdParam) {
            setMissionsFilters({ competencyId: competencyIdParam });
            return;
        }

        if (!missionIdParam || missionsEntries.length === 0) {
            return;
        }

        const targetEntry = missionsEntries.find(
            (entry) => entry.id === missionIdParam || entry.tasks.some((task) => task.id === missionIdParam),
        );

        if (targetEntry?.competencyId !== undefined && targetEntry.competencyId !== null) {
            setMissionsFilters({ competencyId: String(targetEntry.competencyId) });
        }
    }, [competencyIdParam, missionIdParam, missionsEntries, setMissionsFilters]);

    const missionStatusOptions = useMemo(
        () =>
            [{ value: "all", label: "Все статусы" }].concat(
                statusOrder.map((status) => ({
                    value: status,
                    label: missionStatusLabels[status] ?? status,
                })),
            ),
        [missionStatusLabels],
    );

    const missionSections = useMemo(
        () =>
            missionsEntries
                .map((entry) => ({
                    id: entry.id,
                    title: entry.title,
                    items: toMissionCards(entry),
                }))
                .filter((section) => section.items.length > 0),
        [missionsEntries],
    );

    const handleFilterChange = (key: FilterKey, value: string) => {
        const nextParams = new URLSearchParams(searchParams);

        nextParams.delete("missionId");

        if (key === "status") {
            if (value === "all") {
                nextParams.delete("status");
            } else {
                nextParams.set("status", value);
            }

            setMissionsFilters({ status: value as EntryMissionStatus | "all" });
            setSearchParams(nextParams, { replace: true });
            return;
        }

        if (value === "all") {
            nextParams.delete("competencyId");
        } else {
            nextParams.set("competencyId", value);
        }

        setMissionsFilters({ competencyId: value });
        setSearchParams(nextParams, { replace: true });
    };
    if (isMissionsLoading && missionsEntries.length === 0) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                Загружаем миссии...
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
            <div className={styles.filters}>
                <Select
                    items={missionStatusOptions}
                    value={missionsFilters.status}
                    onChange={(event) => handleFilterChange("status", event.target.value)}
                />
                <Select
                    items={missionFilterOptions}
                    value={missionsFilters.competencyId}
                    onChange={(event) => handleFilterChange("competencyId", event.target.value)}
                />
            </div>

            {missionSections.length === 0 ? (
                <SpaceCard variant="glass" className={styles.stateCard}>
                    Миссии по выбранным фильтрам не найдены.
                </SpaceCard>
            ) : (
                missionSections.map((section) => (
                    <MissionCollapse key={section.id} title={section.title} items={section.items} />
                ))
            )}
        </div>
    );
};

export default MissionsPage;

