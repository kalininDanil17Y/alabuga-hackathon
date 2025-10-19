import { useEffect, useMemo } from "react";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { MissionCollapse } from "@/components/dashboard/missions/dashboard-misssion-collapse.tsx";
import { mapEntryToMissionCards } from "@/lib/mission-cards";
import { useDashboardStore } from "@/store/dashboardStore";
import styles from "./History.module.css";

const DashboardJournalHistory = () => {
    const {
        missionsHistoryEntries,
        isMissionsHistoryLoading,
        missionsHistoryError,
        fetchMissionsHistory,
    } = useDashboardStore((state) => ({
        missionsHistoryEntries: state.missionsHistoryEntries,
        isMissionsHistoryLoading: state.isMissionsHistoryLoading,
        missionsHistoryError: state.missionsHistoryError,
        fetchMissionsHistory: state.fetchMissionsHistory,
    }));

    useEffect(() => {
        void fetchMissionsHistory();
    }, [fetchMissionsHistory]);

    const handleRetry = () => {
        void fetchMissionsHistory(true);
    };

    const historySections = useMemo(
        () =>
            missionsHistoryEntries
                .map((entry) => ({
                    id: entry.id,
                    title: entry.title,
                    items: mapEntryToMissionCards(entry, { filterStatuses: ["completed"] }),
                }))
                .filter((section) => section.items.length > 0),
        [missionsHistoryEntries],
    );

    if (isMissionsHistoryLoading && historySections.length === 0) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <p className={styles.stateMessage}>Загружаем выполненные миссии...</p>
            </SpaceCard>
        );
    }

    if (missionsHistoryError) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <p className={styles.stateMessage}>{missionsHistoryError}</p>
                <div className={styles.actions}>
                    <SpaceButton onClick={handleRetry} variant="outline">
                        Повторить попытку
                    </SpaceButton>
                </div>
            </SpaceCard>
        );
    }

    if (historySections.length === 0) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <p className={styles.stateMessage}>Выполненных миссий пока нет.</p>
            </SpaceCard>
        );
    }

    return (
        <div className={styles.root}>
            {historySections.map((section) => (
                <MissionCollapse key={section.id} title={section.title} items={section.items} />
            ))}
        </div>
    );
};

export default DashboardJournalHistory;
