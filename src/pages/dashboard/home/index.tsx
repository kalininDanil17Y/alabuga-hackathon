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

const missionFocusMap: Record<string, { missionId: string; competencyId?: number }> = {
    mission_001: {
        missionId: "mission_alpha_2",
        competencyId: 2,
    },
    mission_002: {
        missionId: "mission_gamma_1",
        competencyId: 3,
    },
    mission_003: {
        missionId: "mission_alpha_3",
        competencyId: 2,
    },
    mission_004: {
        missionId: "mission_beta_2",
        competencyId: 1,
    },
    mission_005: { missionId: "mission_delta", competencyId: 4 },
    mission_006: {
        missionId: "mission_gamma_2",
        competencyId: 3,
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
        competencyId?: number;
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
            params.set("competencyId", competencyParam.toString());
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
                                        <p className="text-white text-[9px] font-normal">{mission.description || mission.id}</p>
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
                    <TexturePanel contentClassName="p-4 flex flex-col">
                        <HorizontalRule paddingX="4px" variant="v2"/>

                        {competencyItems.map((competency) => {
                            return (
                                <div
                                    key={competency.id}
                                    className="grid grid-cols-1 sm:grid-cols-[3fr_2fr_1fr] items-center gap-x-4 gap-y-2 mb-2"
                                >
                                    <div className="text-sm sm:text-base">
                                        {competency.title}
                                    </div>

                                    <div className="w-full">
                                        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-6 mt-1 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-3 sm:h-6 rounded-full dark:bg-blue-500 transition-all"
                                                style={{ width: competency.progress }}
                                                aria-valuenow={parseInt((45).toString())}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-center sm:pt-0">
                                        <Button1 onClick={() => handleNavigateToMissions({competencyId: competency.id})}>
                                            Задания
                                        </Button1>
                                    </div>

                                    {/* разделитель между строками/элементами */}
                                    <div className="col-span-full">
                                        <HorizontalRule paddingX="4px" variant="v2"/>
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

            <HorizontalRule paddingX="6px" mirrored={true}/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-[12px] uppercase font-medium">Последние активности</h3>
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
                                <p className="text-white text-[9px]">{activity.title}</p>
                                <Button1>Подробнее</Button1>
                            </div>
                        </SpaceCard>
                    ))}
                </div>
            </div>

            <HorizontalRule paddingX="6px"/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-[12px] uppercase font-medium">Статистика</h3>
                    <Button1>
                        Посмотреть все
                    </Button1>
                </div>
                <div className="space-y-2">
                    <HorizontalRule paddingX="4px" variant="v2"/>
                    {overviewStats.map((stat, index) => (
                        <div key={index}>

                            <div className="grid grid-cols-5 gap-4 pt-1 pb-2 items-center">
                                <p className="col-span-3 text-white text-[9px]">{stat.label}</p>
                                <p className="col-span-2 text-white text-[19px] font-bold">{stat.value}</p>
                            </div>

                            <HorizontalRule paddingX="4px" variant="v2"/>
                        </div>
                    ))}
                </div>
            </div>

            <HorizontalRule paddingX="6px" mirrored={true}/>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-[12px] uppercase font-medium">Последние артефакты</h3>
                    <Button1>
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
