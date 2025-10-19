import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { useDashboardStore } from "@/store/dashboardStore";
import type { MissionStatus as EntryMissionStatus } from "@/types/missions";
import styles from "./DashboardMissions.module.css";
import { Select } from "@/components/ui/custom/select.tsx";
import { MissionCollapse } from "@/components/dashboard/missions/dashboard-misssion-collapse.tsx";
import MissionDetailsModal, {
    type MissionDetailViewModel,
} from "@/components/dashboard/missions/mission-details-modal";
import { mapEntryToMissionCards, missionStatusToCardStatus } from "@/lib/mission-cards";

type FilterKey = "status" | "competencyId";

const statusOrder: EntryMissionStatus[] = ["available", "in_progress", "moderation", "completed"];

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
        advanceMission,
    } = useDashboardStore((state) => ({
        missionsEntries: state.missionsEntries,
        missionStatusLabels: state.missionStatusLabels,
        missionFilterOptions: state.missionFilterOptions,
        missionsFilters: state.missionsFilters,
        fetchMissionsPage: state.fetchMissionsPage,
        isMissionsLoading: state.isMissionsLoading,
        missionsError: state.missionsError,
        setMissionsFilters: state.setMissionsFilters,
        advanceMission: state.advanceMission,
    }));

    const [searchParams, setSearchParams] = useSearchParams();
    const missionIdParam = searchParams.get("missionId");
    const competencyIdParam = searchParams.get("competencyId");
    const statusParam = searchParams.get("status");

    const scrolledMissionIdRef = useRef<string | null>(null);
    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        if (!missionIdParam || missionsEntries.length === 0) {
            return;
        }

        if (selectedMissionId === missionIdParam && isModalOpen) {
            return;
        }

        const missionExists = missionsEntries.some((entry) => entry.tasks.some((task) => task.id === missionIdParam));

        if (!missionExists) {
            return;
        }

        setSelectedMissionId(missionIdParam);
        setIsModalOpen(true);
    }, [missionIdParam, missionsEntries, selectedMissionId, isModalOpen]);

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

    const statusPriority = useMemo(() => {
        const order = statusOrder.map((status) => missionStatusToCardStatus[status] ?? "available");
        return order.reduce<Record<string, number>>((acc, status, index) => {
            acc[status] = index;
            return acc;
        }, {});
    }, []);

    const missionSections = useMemo(() => {
        const filterStatuses =
            missionsFilters.status === "all"
                ? undefined
                : [missionsFilters.status as EntryMissionStatus];

        return missionsEntries
            .map((entry) => {
                const items = mapEntryToMissionCards(entry, filterStatuses ? { filterStatuses } : undefined);
                const sortedItems = items
                    .map((item, orderIndex) => ({ item, orderIndex }))
                    .sort((a, b) => {
                        const aPriority = statusPriority[a.item.status] ?? Number.MAX_SAFE_INTEGER;
                        const bPriority = statusPriority[b.item.status] ?? Number.MAX_SAFE_INTEGER;

                        if (aPriority !== bPriority) {
                            return aPriority - bPriority;
                        }

                        return a.orderIndex - b.orderIndex;
                    })
                    .map(({ item }) => item);

                return {
                    id: entry.id,
                    title: entry.title,
                    items: sortedItems,
                };
            })
            .filter((section) => section.items.length > 0);
    }, [missionsEntries, missionsFilters.status, statusPriority]);

    const selectedMissionData = useMemo(() => {
        if (!selectedMissionId) {
            return null;
        }

        for (const entry of missionsEntries) {
            const task = entry.tasks.find((mission) => mission.id === selectedMissionId);
            if (task) {
                return { entry, task };
            }
        }

        return null;
    }, [missionsEntries, selectedMissionId]);

    const missionModalData = useMemo<MissionDetailViewModel | null>(() => {
        if (!selectedMissionData) {
            return null;
        }

        const { entry, task } = selectedMissionData;
        const statusLabel = missionStatusLabels[task.status] ?? task.status;
        const cardStatus = missionStatusToCardStatus[task.status] ?? "available";
        const manaReward = typeof task.reward?.currency === "number" ? task.reward.currency : task.reward?.xp ?? 0;
        const expReward = task.reward?.xp ?? 0;
        const artifactItems = Array.isArray(task.reward?.items) ? task.reward?.items ?? [] : [];
        const artifactCount = artifactItems.length;
        const competencies = task.competencyIds;
        const progress = typeof task.progress === "number" ? task.progress : null;
        const deadline = task.deadline ?? null;

        return {
            id: task.id,
            title: task.title || entry.title,
            entryTitle: entry.title,
            description: task.description ?? entry.description ?? "",
            statusLabel,
            status: cardStatus,
            mana: manaReward,
            exp: expReward,
            artifactItems,
            artifactCount,
            competencies,
            progress,
            deadline,
        };
    }, [selectedMissionData, missionStatusLabels]);

    const handleMissionDetails = useCallback((missionId: string) => {
        setSelectedMissionId(missionId);
        setIsModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setSelectedMissionId(null);

        if (missionIdParam) {
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.delete("missionId");
            setSearchParams(nextParams, { replace: true });
        }
    }, [missionIdParam, searchParams, setSearchParams]);

    useEffect(() => {
        if (!missionModalData && isModalOpen) {
            handleModalClose();
        }
    }, [missionModalData, isModalOpen, handleModalClose]);

    const handleMissionAction = useCallback(() => {
        if (!selectedMissionId) {
            return;
        }

        advanceMission(selectedMissionId);
    }, [advanceMission, selectedMissionId]);

    const missionModalAction = useMemo(() => {
        if (!missionModalData) {
            return { label: "принять", disabled: true };
        }

        switch (missionModalData.status) {
            case "progress":
                return { label: "отправить", disabled: false };
            case "moderation":
                return { label: "завершить", disabled: false };
            case "complete":
                return { label: "выполнено", disabled: true };
            case "locked":
                return { label: "недоступно", disabled: true };
            default:
                return { label: "принять", disabled: false };
        }
    }, [missionModalData]);

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
                    <MissionCollapse
                        key={section.id}
                        title={section.title}
                        items={section.items}
                        handleDetailsClick={handleMissionDetails}
                    />
                ))
            )}

            <MissionDetailsModal
                open={isModalOpen && Boolean(missionModalData)}
                onClose={handleModalClose}
                mission={missionModalData}
                onAction={handleMissionAction}
                actionLabel={missionModalAction.label}
                actionDisabled={missionModalAction.disabled}
            />
        </div>
    );
};

export default MissionsPage;
