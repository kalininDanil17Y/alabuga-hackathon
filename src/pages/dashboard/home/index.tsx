import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { TexturePanel } from "@/components/ui/custom/texture-panel";
import {cn, number_format} from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";
import styles from "./DashboardHome.module.css";
import {HorizontalRule} from "@/components/ui/custom/horizontal-rule.tsx";
import {Button1} from "@/components/ui/custom/button1.tsx";

const missionFocusMap: Record<string, { missionId: string; competencyId?: string }> = {
    mission_001: {
        missionId: "mission_alpha_2",
        competencyId: "competency_002",
    },
    mission_002: {
        missionId: "mission_gamma_1",
        competencyId: "competency_003",
    },
    mission_003: {
        missionId: "mission_alpha_3",
        competencyId: "competency_002",
    },
    mission_004: {
        missionId: "mission_beta_2",
        competencyId: "competency_001",
    },
    mission_005: { missionId: "mission_delta", competencyId: "competency_004" },
    mission_006: {
        missionId: "mission_gamma_2",
        competencyId: "competency_003",
    },
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const {
        user,
        missions,
        activity,
        artifacts,
        competencies,
        statistics,
        fetchDashboard,
        isDashboardLoading,
        dashboardError,
    } = useDashboardStore((state) => ({
        user: state.user,
        missions: state.missions,
        activity: state.activity,
        achievements: state.achievements,
        artifacts: state.artifacts,
        competencies: state.competencies,
        statistics: state.statistics,
        fetchDashboard: state.fetchDashboard,
        isDashboardLoading: state.isDashboardLoading,
        dashboardError: state.dashboardError,
    }));
    const [activeTab, setActiveTab] = useState<"missions" | "competencies">("missions");

    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    const missionProgressLabel = useMemo(() => {
        return `Задания`;
    }, [user]);

    const competencyProgressLabel = useMemo(() => {
        return `Компетенции`;
    }, [user]);

    const missionItems = useMemo(() => missions, [missions]);
    const topArtifacts = useMemo(() => artifacts.slice(0, 4), [artifacts]);
    const competencyItems = competencies;

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
            },
            {
                label: "Всего времени в системе",
                value: number_format(60 * 60 * 1.4),
            },
        ];
    }, [statistics]);

    const handleNavigateToMissions = (options?: {
        missionId?: string;
        competencyId?: string;
    }) => {
        const params = new URLSearchParams();

        let missionParam = options?.missionId;
        let competencyParam = options?.competencyId ?? undefined;

        if (missionParam && missionFocusMap[missionParam]) {
            const mapping = missionFocusMap[missionParam];
            missionParam = mapping.missionId;
            competencyParam = competencyParam ?? mapping.competencyId;
        }

        if (missionParam) {
            params.set("missionId", missionParam);
        }

        if (competencyParam) {
            params.set("competencyId", competencyParam);
        }

        navigate({
            pathname: "/dashboard/missions",
            search: params.toString(),
        });
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
        <div className="space-y-6">
            <div className="px-0 pb-0">
                <p className="text-white/100 text-base leading-4 text-center mb-4">
                    Повышение ранга требует
                </p>

                <SpaceCard className={clsx(styles["experience-card"], "p-4 mx-3 mb-3 border-0 shadow-none")}
                >

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
                                    <div className="flex-1 pr-4">
                                        <p className="text-white text-xs font-normal">{mission.title || mission.id}</p>
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
                    <TexturePanel contentClassName="p-4 space-y-3">
                        {competencyItems.map((competency) => {
                            const [currentRaw = "0", totalRaw = "0"] = competency.progress
                                .split("/")
                                .map((value) => value.trim());
                            const currentValue = Number(currentRaw);
                            const totalValue = Number(totalRaw);
                            const safeTotal =
                                Number.isFinite(totalValue) && totalValue > 0 ? totalValue : 0;
                            const safeCurrent = Number.isFinite(currentValue)
                                ? Math.max(currentValue, 0)
                                : 0;
                            const clampedCurrent =
                                safeTotal > 0 ? Math.min(safeCurrent, safeTotal) : safeCurrent;
                            const ratio = safeTotal > 0 ? clampedCurrent / safeTotal : 0;
                            const percentLabel = safeTotal > 0 ? Math.round(ratio * 100) : 0;
                            const progressDisplayTotal =
                                safeTotal > 0
                                    ? safeTotal
                                    : Number.isFinite(totalValue)
                                        ? Math.max(totalValue, 0)
                                        : 0;
                            const progressLabel = `${clampedCurrent} / ${progressDisplayTotal}`;
                            const widthPercentage = Math.min(100, Math.max(0, ratio * 100));

                            return (
                                <div key={competency.id} className={styles["competency-item"]}>
                                    <div className="w-full md:min-w-[200px] md:pr-6">
                                        <p className="text-white text-sm font-medium">
                                            {competency.title}
                                        </p>
                                        <p className="text-space-cyan-300/80 text-xs mt-1">
                                            {competency.description}
                                        </p>
                                    </div>
                                    <div className="flex w-full flex-1 flex-col gap-4 md:flex-row md:items-center md:gap-5">
                                        <div className="flex w-full flex-col gap-1">
                                            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/60">
                                                <span>Прогресс</span>
                                                <span>{progressLabel}</span>
                                            </div>
                                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/15">
                                                <div
                                                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-space-cyan-300 via-space-cyan-400 to-space-blue-700 shadow-[0_0_12px_rgba(106,207,246,0.45)] transition-all duration-500 ease-out"
                                                    style={{ width: `${widthPercentage}%` }}
                                                />
                                                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white/80">
                                                    {percentLabel}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button1 onClick={() =>
                                                handleNavigateToMissions({
                                                    competencyId: competency.id,
                                                })
                                            }>
                                                ЗАДАНИЯ
                                            </Button1>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="text-center pt-2">
                            <Button1 onClick={() => handleNavigateToMissions()}>
                                ВЕСЬ СПИСОК
                            </Button1>
                        </div>
                    </TexturePanel>
                )}
            </div>

            <HorizontalRule paddingX="1rem"/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-lg uppercase font-medium">Последние активности</h3>
                    <Button1>
                        Посмотреть все
                    </Button1>
                </div>
                <div className="space-y-2">
                    {activity.map((activity) => (
                        <SpaceCard
                            key={activity.id}
                            variant="glass"
                            className="p-3 flex items-center justify-between"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-white text-xs">{activity.title}</p>
                                <Button1>Подробнее</Button1>
                            </div>
                        </SpaceCard>
                    ))}
                </div>
            </div>

            <HorizontalRule paddingX="1rem" mirrored={true}/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-lg uppercase font-medium">Статистика</h3>
                    <Button1>
                        Посмотреть все
                    </Button1>
                </div>
                <div className="space-y-2">
                    <HorizontalRule paddingX="4px" variant="v2"/>
                    {overviewStats.map((stat) => (
                        <div>

                            <div className="grid grid-cols-5 gap-4 pt-1 pb-2 items-center">
                                <p className="col-span-3 text-white text-base">{stat.label}</p>
                                <p className="col-span-2 text-white text-base font-bold">{stat.value}</p>
                            </div>

                            <HorizontalRule paddingX="4px" variant="v2"/>
                        </div>
                    ))}
                </div>
            </div>

            <HorizontalRule paddingX="1rem"/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-lg uppercase font-medium">Последние артефакты</h3>
                    <Button1>
                        Посмотреть все
                    </Button1>
                </div>

                <div className="grid grid-cols-6 gap-3">
                    {/* создаём массив из 6 элементов и заполняем его либо артефактами, либо null */}
                    {Array.from({ length: 6 }).map((_, index) => {
                        const artifact = topArtifacts[index];

                        return (
                            <SpaceCard
                                key={artifact?.id ?? `empty-${index}`}
                                variant="artefacts"
                                className={clsx(
                                    "aspect-square flex items-center justify-center text-center p-3",
                                )}
                            >
                                {artifact ? (
                                    <></>
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
