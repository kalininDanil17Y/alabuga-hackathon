import { useCallback, useEffect, useMemo, useState } from "react";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { MissionCollapse } from "@/components/dashboard/missions/dashboard-misssion-collapse.tsx";
import type { MissionEntry } from "@/types/missions";
import { mapEntryToMissionCards } from "@/lib/mission-cards";
import styles from "./History.module.css";

interface MissionsPageResponse {
    entries: MissionEntry[];
}

const HISTORY_ENDPOINT = "/api/missions/page?status=completed";

const DashboardJournalHistory = () => {
    const [entries, setEntries] = useState<MissionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async (signal?: AbortSignal) => {
        try {
            const response = await fetch(HISTORY_ENDPOINT, { signal });
            if (!response.ok) {
                throw new Error("Не удалось загрузить историю миссий");
            }

            const data = (await response.json()) as MissionsPageResponse;
            setEntries(data.entries ?? []);
            setError(null);
        } catch (fetchError) {
            if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
                return;
            }

            const message = fetchError instanceof Error ? fetchError.message : "Не удалось загрузить историю миссий";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setError(null);
        setIsLoading(true);
        void fetchHistory(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchHistory]);

    const handleRetry = () => {
        setError(null);
        setIsLoading(true);
        void fetchHistory();
    };

    const historySections = useMemo(
        () =>
            entries
                .map((entry) => ({
                    id: entry.id,
                    title: entry.title,
                    items: mapEntryToMissionCards(entry, { filterStatuses: ["completed"] }),
                }))
                .filter((section) => section.items.length > 0),
        [entries],
    );

    if (isLoading && historySections.length === 0) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <p className={styles.stateMessage}>Загружаем выполненные миссии...</p>
            </SpaceCard>
        );
    }

    if (error) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <p className={styles.stateMessage}>{error}</p>
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
