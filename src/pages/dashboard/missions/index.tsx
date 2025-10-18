import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { useDashboardStore } from "@/store/dashboardStore";
import type { MissionStatus as EntryMissionStatus } from "@/types/missions";
import styles from "./DashboardMissions.module.css";
import { Select } from "@/components/ui/custom/select.tsx";
import { MissionCollapse } from "@/components/dashboard/missions/dashboard-misssion-collapse.tsx";
import { mapEntryToMissionCards } from "@/lib/mission-cards";

type FilterKey = "status" | "competencyId";

const statusOrder: EntryMissionStatus[] = ["available", "in_progress", "moderation", "completed", "locked"];

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
    const statusParam = searchParams.get("status");

    const scrolledMissionIdRef = useRef<string | null>(null);

    useEffect(() => {
        void fetchMissionsPage();
    }, [fetchMissionsPage]);

    useEffect(() => {
        if (competencyIdParam) {
            setMissionsFilters({ competencyId: competencyIdParam, status: "all" });
            return;
        }

        if (missionIdParam) {
            setMissionsFilters({ competencyId: "all", status: "all" });
            return;
        }

        if (!statusParam) {
            setMissionsFilters({ competencyId: "all", status: "all" });
        }
    }, [competencyIdParam, missionIdParam, statusParam, setMissionsFilters]);

    useEffect(() => {
        if (!missionIdParam) {
            scrolledMissionIdRef.current = null;
            return;
        }

        if (missionsEntries.length === 0) {
            return;
        }

        if (scrolledMissionIdRef.current === missionIdParam) {
            return;
        }

        const target = document.querySelector<HTMLElement>(`[data-mission-id="${missionIdParam}"]`);
        if (!target) {
            return;
        }

        scrolledMissionIdRef.current = missionIdParam;
        const scrollToTarget = () => target.scrollIntoView({ behavior: "smooth", block: "center" });

        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(scrollToTarget);
        } else {
            scrollToTarget();
        }
    }, [missionIdParam, missionsEntries]);

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
                    items: mapEntryToMissionCards(entry),
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

