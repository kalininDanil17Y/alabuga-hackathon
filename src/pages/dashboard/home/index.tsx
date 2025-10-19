import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { TexturePanel } from "@/components/ui/custom/texture-panel";
import { cn, number_format } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";
import styles from "./DashboardHome.module.css";
import { HorizontalRule } from "@/components/ui/custom/horizontal-rule.tsx";
import { Button1 } from "@/components/ui/custom/button1.tsx";
import Mana from "@/images/ui/mana.svg?react";
import { mapEntryToMissionCards } from "@/lib/mission-cards";
import type { Mission } from "@/types/dashboard";

type HistoryMissionRecord = {
    mission: ReturnType<typeof mapEntryToMissionCards>[number];
    entryOrder: number;
    missionOrder: number;
};

const MAX_MISSION_ITEMS = 6;

type MissionWithTimestamp = {
    mission: Mission;
    timestamp: number;
};

const parseTimestamp = (value?: string | number | null): number | null => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
            return numeric;
        }

        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return null;
};

const getMissionStatusTimestamp = (mission: Mission, index: number): number => {
    const statusKey = mission.status;
    const statusMaps = mission.statusChangeDates ?? mission.statusDates ?? mission.statusTimestamps;

    if (statusMaps) {
        const rawStatusTimestamp = statusMaps[statusKey];
        const parsedStatusTimestamp = parseTimestamp(rawStatusTimestamp ?? null);
        if (parsedStatusTimestamp !== null) {
            return parsedStatusTimestamp;
        }
    }

    const statusSpecificCandidates =
        statusKey === "available"
            ? [mission.availableSince, mission.availableAt]
            : statusKey === "in_progress"
                ? [mission.inProgressSince, mission.inProgressAt]
                : [];

    for (const candidate of statusSpecificCandidates) {
        const parsedCandidate = parseTimestamp(candidate ?? null);
        if (parsedCandidate !== null) {
            return parsedCandidate;
        }
    }

    const fallbackTimestamp = parseTimestamp(mission.statusUpdatedAt ?? mission.updatedAt ?? mission.completedDate ?? null);

    if (fallbackTimestamp !== null) {
        return fallbackTimestamp;
    }

    return index;
};

const sortByTimestampDesc = (a: MissionWithTimestamp, b: MissionWithTimestamp) => b.timestamp - a.timestamp;

const buildMissionDisplayList = (missions: Mission[]): Mission[] => {
    if (!Array.isArray(missions) || missions.length === 0) {
        return [];
    }

    const enriched: MissionWithTimestamp[] = missions.map((mission, index) => ({
        mission,
        timestamp: getMissionStatusTimestamp(mission, index),
    }));

    const selectByStatus = (status: Mission["status"]) =>
        enriched
            .filter((item) => item.mission.status === status)
            .sort(sortByTimestampDesc)
            .map((item) => item.mission);

    const availableMissions = selectByStatus("available");
    const inProgressMissions = selectByStatus("in_progress");

    const combined = [...availableMissions, ...inProgressMissions];
    if (combined.length >= MAX_MISSION_ITEMS) {
        return combined.slice(0, MAX_MISSION_ITEMS);
    }

    if (combined.length < MAX_MISSION_ITEMS) {
        const remainingSlots = MAX_MISSION_ITEMS - combined.length;
        const fallbackMissions = enriched
            .filter((item) => item.mission.status !== "available" && item.mission.status !== "in_progress")
            .sort(sortByTimestampDesc)
            .map((item) => item.mission)
            .slice(0, remainingSlots);

        return combined.concat(fallbackMissions);
    }

    return combined;
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const {
        user,
        missions,
        artifacts,
        competencies,
        statistics,
        fetchDashboard,
        isDashboardLoading,
        dashboardError,
        setMissionsFilters,
        missionsHistoryEntries,
        fetchMissionsHistory,
        isMissionsHistoryLoading,
        missionsHistoryError,
    } = useDashboardStore((state) => ({
        user: state.user,
        missions: state.missions,
        achievements: state.achievements,
        artifacts: state.artifacts,
        competencies: state.competencies,
        statistics: state.statistics,
        fetchDashboard: state.fetchDashboard,
        isDashboardLoading: state.isDashboardLoading,
        dashboardError: state.dashboardError,
        setMissionsFilters: state.setMissionsFilters,
        missionsHistoryEntries: state.missionsHistoryEntries,
        fetchMissionsHistory: state.fetchMissionsHistory,
        isMissionsHistoryLoading: state.isMissionsHistoryLoading,
        missionsHistoryError: state.missionsHistoryError,
    }));
    const [activeTab, setActiveTab] = useState<"missions" | "competencies">("missions");
    const [isStatsExpanded, setIsStatsExpanded] = useState(false);

    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    useEffect(() => {
        void fetchMissionsHistory();
    }, [fetchMissionsHistory]);

    const missionProgressLabel = useMemo(() => {
        return `Задания`;
    }, [user]);

    const competencyProgressLabel = useMemo(() => {
        return `Компетенции`;
    }, [user]);

    const missionItems = useMemo(() => buildMissionDisplayList(missions), [missions]);
    const topArtifacts = useMemo(() => artifacts.slice(0, 4), [artifacts]);
    const competencyItems = competencies;

    const historyMissions = useMemo<HistoryMissionRecord[]>(() => {
        return missionsHistoryEntries.flatMap((entry, entryIndex) => {
            const missions = mapEntryToMissionCards(entry, { filterStatuses: ["completed"] });
            return missions.map((mission, missionIndex) => ({
                mission,
                entryOrder: entryIndex,
                missionOrder: missionIndex,
            }));
        });
    }, [missionsHistoryEntries]);

    const recentHistoryMissions = useMemo(() => {
        if (historyMissions.length === 0) {
            return [] as HistoryMissionRecord["mission"][];
        }

        const sorted = historyMissions.slice().sort((a, b) => {
            const timeA = a.mission.completedDate ? Date.parse(a.mission.completedDate) : NaN;
            const timeB = b.mission.completedDate ? Date.parse(b.mission.completedDate) : NaN;
            const hasValidTimeA = Number.isFinite(timeA);
            const hasValidTimeB = Number.isFinite(timeB);

            if (hasValidTimeA || hasValidTimeB) {
                const safeTimeA = hasValidTimeA ? timeA : Number.NEGATIVE_INFINITY;
                const safeTimeB = hasValidTimeB ? timeB : Number.NEGATIVE_INFINITY;
                if (safeTimeA !== safeTimeB) {
                    return safeTimeB - safeTimeA;
                }
            }

            if (a.entryOrder !== b.entryOrder) {
                return b.entryOrder - a.entryOrder;
            }

            if (a.missionOrder !== b.missionOrder) {
                return b.missionOrder - a.missionOrder;
            }

            return 0;
        });

        return sorted.slice(0, 3).map((item) => item.mission);
    }, [historyMissions]);

    const overviewStats = useMemo(() => {
        if (!statistics?.overview) {
            return [] as Array<{ label: string; value: string }>;
        }
        return [
            {
                label: "Общее количество выполненных миссий",
                value: number_format(statistics.overview.totalMissions),
            },
            {
                label: "Заработанный опыт",
                value: number_format(statistics.overview.totalExperience),
            },
            {
                label: "Заработанная мана",
                value: number_format(12345),
                icon: <Mana width="16px" height="16px" />
            },
            {
                label: "Всего времени в системе",
                value: number_format(60 * 60 * 1.4),
            },
        ];
    }, [statistics]);

    const statsToDisplay = useMemo(() => {
        if (isStatsExpanded) {
            return overviewStats;
        }

        return overviewStats.slice(0, 1);
    }, [isStatsExpanded, overviewStats]);

    const hasMoreStats = overviewStats.length > 1;

    const handleNavigateToMissions = (options?: {
        missionId?: string;
        competencyId?: number;
    }) => {
        const params = new URLSearchParams();

        if (options?.missionId) {
            params.set("missionId", options.missionId);
            setMissionsFilters({ status: "all", competencyId: "all" });
        } else if (options?.competencyId) {
            const competencyId = options.competencyId.toString();
            params.set("competencyId", competencyId);
            setMissionsFilters({ status: "all", competencyId });
        } else {
            setMissionsFilters({ status: "all", competencyId: "all" });
        }

        navigate({
            pathname: "/dashboard/missions",
            search: params.toString(),
        });
    };

    const handleNavigateToHistoryMission = (missionId: string) => {
        navigate({
            pathname: "/dashboard/journal/history",
            hash: `mission-${missionId}`,
        });
    };

    const handleRetryFetchHistory = () => {
        void fetchMissionsHistory(true);
    };

    if (isDashboardLoading && !user) {
        return <div className={styles.stateMessage}>Загружаем данные...</div>;
    }

    if (dashboardError) {
        return (
            <div className={styles.stateError}>
                <div className={styles.stateContent}>
                    <p>{dashboardError}</p>
                    <SpaceButton variant="outline" onClick={() => fetchDashboard(true)}>
                        Повторить попытку
                    </SpaceButton>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="px-0 pb-0 text-[10px]">
                <p className="text-white/100 leading-4 text-center mb-4">
                    Повышение ранга требует
                </p>

                <SpaceCard className={clsx(styles["experience-card"], "mb-3 border-0 shadow-none")}>
                    <span>Опыт: </span>
                    <span>{user.experience.current}/{user.experience.max}</span>
                </SpaceCard>
            </div>

            <div>
                <div className="mb-1 flex justify-center gap-3">
                    {[
                        {
                            id: "missions" as const,
                            label: missionProgressLabel,
                        },
                        {
                            id: "competencies" as const,
                            label: competencyProgressLabel,
                        },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    styles["dashboard-tab"],
                                    isActive && styles["dashboard-tab-active"],
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                {activeTab === "missions" ? (
                    <TexturePanel contentClassName="p-0 pb-3">
                        <div className="space-y-2">
                            {missionItems.map((mission) => (
                                <div key={mission.id} className={styles["mission-item"]}>
                                    <div className="flex-1">
                                        <p className="text-white text-[9px] font-normal">{mission.title || mission.id}</p>
                                    </div>
                                    <Button1 onClick={() =>
                                        handleNavigateToMissions({ missionId: mission.id })
                                    }>
                                        К ЗАДАНИЮ
                                    </Button1>
                                </div>
                            ))}

                            <div className="text-center pt-2">
                                <Button1 onClick={() =>
                                    handleNavigateToMissions()
                                }>
                                    ВЕСЬ СПИСОК
                                </Button1>
                            </div>
                        </div>
                    </TexturePanel>
                ) : (
                    <TexturePanel contentClassName="flex flex-col p-[3px]">

                        {competencyItems.map((competency) => (
                            <div key={competency.id}>
                                <div className="grid grid-cols-[5fr_1fr_2fr_1fr] items-center gap-x-1 mb-2 mt-[6px]">
                                    <div className={styles.competencyItemTitle}>
                                        <img
                                            src={`/images/competencies/c${competency.id}.svg`}
                                            alt={`${competency.id} - ${competency.title}`}
                                            className="w-4 h-4"
                                        />
                                        <p className={styles.competencyItemText}>{competency.title}</p>
                                    </div>

                                    <div className={"text-[9px]"}>
                                        Ур.{competency.level}
                                    </div>

                                    <div className="flex flex-row items-center w-full gap-[3px]">
                                        <span className="text-[9px]">{competency.value}/{competency.max}</span>
                                        <div className="w-full rounded-full h-[8px] bg-gradient-to-t from-[#0C1751] to-[#1B34B7] border-[#005DAC] border-solid border-[1px]">
                                            <div
                                                className="h-[6px] rounded-full bg-[#00AEEF] transition-all"
                                                style={{ width: `${(competency.value / competency.max) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Button1 onClick={() => handleNavigateToMissions({ competencyId: competency.id })}>
                                        Задания
                                    </Button1>
                                </div>

                                <HorizontalRule variant="v2" />
                            </div>
                        ))}


                        <div className="text-center pt-2 pb-2">
                            <Button1 onClick={() => handleNavigateToMissions()}>
                                ВЕСЬ СПИСОК
                            </Button1>
                        </div>
                    </TexturePanel>

                )}
            </div>

            <HorizontalRule paddingX="6px" mirrored={true}/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-[12px] uppercase font-medium">Последние активности</h3>
                    <Button1 onClick={() => navigate('/dashboard/journal/history')}>
                        Посмотреть все
                    </Button1>
                </div>
                <div className="space-y-2">
                    {missionsHistoryError ? (
                        <SpaceCard className="p-3 space-y-2">
                            <p className="text-white text-[9px]">{missionsHistoryError}</p>
                            <div className="flex justify-end">
                                <Button1 onClick={handleRetryFetchHistory}>
                                    Повторить попытку
                                </Button1>
                            </div>
                        </SpaceCard>
                    ) : null}

                    {isMissionsHistoryLoading && historyMissions.length === 0 ? (
                        <SpaceCard className="p-3">
                            <p className="text-white text-[9px]">Загружаем историю активности...</p>
                        </SpaceCard>
                    ) : null}

                    {!isMissionsHistoryLoading && historyMissions.length === 0 && !missionsHistoryError ? (
                        <SpaceCard className="p-3">
                            <p className="text-white text-[9px]">История активности пока пуста.</p>
                        </SpaceCard>
                    ) : null}

                    {recentHistoryMissions.map((mission) => (
                        <SpaceCard
                            key={mission.id}
                            className="p-2 flex items-center justify-between"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-white text-[9px]">{mission.title}</p>
                                <Button1 onClick={() => handleNavigateToHistoryMission(mission.id)}>Подробнее</Button1>
                            </div>
                        </SpaceCard>
                    ))}
                </div>
            </div>

            <HorizontalRule paddingX="6px"/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-[12px] uppercase font-medium">Статистика</h3>
                    <Button1 onClick={() => navigate('/dashboard/journal/statistics')}>
                        Посмотреть все
                    </Button1>
                </div>
                <div className="space-y-2">
                    <HorizontalRule paddingX="4px" variant="v2"/>
                    {statsToDisplay.map((stat) => (
                        <div key={stat.label}>
                            <div className="grid grid-cols-5 gap-4 pt-1 pb-2 items-center">
                                <p className="col-span-3 text-white text-[9px]">{stat.label}</p>
                                <p className="col-span-2 text-white text-[19px] font-bold flex flex-row items-center gap-2">{stat.value} {stat.icon ?? stat.icon}</p>
                            </div>

                            <HorizontalRule paddingX="4px" variant="v2"/>
                        </div>
                    ))}
                    {hasMoreStats ? (
                        <div className="pt-2 flex justify-center">
                            <Button1 onClick={() => setIsStatsExpanded((prev) => !prev)}>
                                {isStatsExpanded ? "СВЕРНУТЬ" : "РАСКРЫТЬ"}
                            </Button1>
                        </div>
                    ) : null}
                </div>
            </div>

            <HorizontalRule paddingX="6px" mirrored={true}/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-[12px] uppercase font-medium">Последние артефакты</h3>
                    <Button1 onClick={() => navigate('/dashboard/journal/artifacts')}>
                        Посмотреть все
                    </Button1>
                </div>

                <div className="grid grid-cols-[repeat(6,_minmax(0,_40px))] justify-around">
                    {Array.from({ length: 6 }).map((_, index) => {
                        const artifact = topArtifacts[index];

                        return (
                            <SpaceCard
                                key={artifact?.id ?? `empty-${index}`}
                                variant="artefacts"
                                className={"aspect-square flex items-center justify-center text-center p-1"}
                            >
                                {artifact ? (
                                    <img src={artifact.image} alt={artifact.name} className="w-full h-full" />
                                ) : null}
                            </SpaceCard>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default DashboardHome;
