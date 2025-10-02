import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button.tsx";
import { SpaceProgress } from "@/components/ui/custom/space-progress.tsx";
import { SpaceCard } from "@/components/ui/custom/space-card.tsx";
import { TexturePanel } from "@/components/ui/custom/texture-panel.tsx";
import { cn } from "@/lib/utils.ts";
import type {
    Achievement,
    Artifact,
    CompetencyItem,
    Mission,
    Statistics,
    User,
} from "@/types/dashboard";
import "./style.css";

type DashboardData = {
    user: User;
    missions: Mission[];
    achievements: Achievement[];
    artifacts: Artifact[];
    competencies: CompetencyItem[];
    statistics: Statistics | null;
};

type OverviewStat = {
    label: string;
    value: string;
};

const index = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"missions" | "competencies">("missions");

    useEffect(() => {
        const controller = new AbortController();

        const fetchJson = async <T,>(url: string): Promise<T> => {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(`Не удалось загрузить ${url}`);
            }
            return (await response.json()) as T;
        };

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [
                    userInfo,
                    missionsInfo,
                    achievementsInfo,
                    artifactsInfo,
                    competenciesInfo,
                    statisticsInfo,
                ] = await Promise.all([
                    fetchJson<User>("/data/user.json"),
                    fetchJson<{ missions: Mission[] }>("/data/missions.json"),
                    fetchJson<{ achievements: Achievement[] }>("/data/achievements.json"),
                    fetchJson<{ artifacts: Artifact[] }>("/data/artifacts.json"),
                    fetchJson<{ competencies: CompetencyItem[] }>("/data/competencies.json"),
                    fetchJson<{ statistics: Statistics }>("/data/statistics.json"),
                ]);

                if (controller.signal.aborted) {
                    return;
                }

                setDashboardData({
                    user: userInfo,
                    missions: missionsInfo?.missions ?? [],
                    achievements: achievementsInfo?.achievements ?? [],
                    artifacts: artifactsInfo?.artifacts ?? [],
                    competencies: competenciesInfo?.competencies ?? [],
                    statistics: statisticsInfo?.statistics ?? null,
                });
            } catch (loadError) {
                if (controller.signal.aborted) {
                    return;
                }
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Не удалось загрузить данные дашборда",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadData();

        return () => controller.abort();
    }, []);

    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="py-10 text-center text-white/70">
                Загружаем данные...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-10 text-center text-red-300">
                {error}
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { user, missions, achievements, artifacts, competencies, statistics } =
        dashboardData;

    const missionFocusMap: Record<
        string,
        { missionId: string; competencyId?: string }
    > = {
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

    const missionProgressLabel = `Задания: ${user.tasks.completed}/${user.tasks.total}`;
    const competencyProgressLabel = `Компетенции: ${user.competencies.completed}/${user.competencies.total}`;
    const topMissions = missions.slice(0, 6);
    const topAchievements = achievements.slice(0, 4);
    const topArtifacts = artifacts.slice(0, 4);
    const competencyItems = competencies;
    const overviewStats: OverviewStat[] = statistics
        ? [
              {
                  label: "Всего миссий",
                  value: String(statistics.overview.totalMissions),
              },
              {
                  label: "Завершено",
                  value: String(statistics.overview.completedMissions),
              },
              {
                  label: "Успешность",
                  value: `${statistics.overview.successRate}%`,
              },
              {
                  label: "Текущий уровень",
                  value: `LVL ${statistics.overview.currentLevel}`,
              },
          ]
        : [];

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

    return (
        <div className="space-y-6">
            <div className="px-0 pt-3 pb-0">
                <p className="text-white/70 text-xs leading-4 text-center mt-3 mb-4">
                    Повышение ранга требует
                </p>

                <SpaceCard className="experience-card p-4 mx-3 mb-3 border-0 shadow-none">
                    <SpaceProgress
                        value={user.experience.current}
                        max={user.experience.max}
                        label="Опыт"
                        showValues
                        showPercentage
                    />
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
                                className={cn("dashboard-tab", isActive && "dashboard-tab-active")}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                {activeTab === "missions" ? (
                    <TexturePanel className="mission-panel" contentClassName="p-4">
                        <div className="space-y-2">
                            {topMissions.map((mission) => (
                                <div key={mission.id} className="mission-item">
                                    <div className="flex-1 pr-4">
                                        <p className="text-white text-xs font-normal">{mission.title}</p>
                                    </div>
                                    <button
                                        className="mission-button"
                                        onClick={() =>
                                            handleNavigateToMissions({ missionId: mission.id })
                                        }
                                    >
                                        К ЗАДАНИЮ
                                    </button>
                                </div>
                            ))}

                            <div className="text-center pt-2">
                                <button
                                    className="view-all-button"
                                    onClick={() => handleNavigateToMissions()}
                                >
                                    ВЕСЬ СПИСОК
                                </button>
                            </div>
                        </div>
                    </TexturePanel>
                ) : (
                    <TexturePanel
                        className="competency-panel"
                        contentClassName="p-4 space-y-3"
                    >
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
                                <div key={competency.id} className="competency-item">
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
                                            <button
                                                className="mission-button flex-shrink-0"
                                                onClick={() =>
                                                    handleNavigateToMissions({
                                                        competencyId: competency.id,
                                                    })
                                                }
                                            >
                                                Задания
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="text-center pt-2">
                            <button
                                className="view-all-button"
                                onClick={() => handleNavigateToMissions()}
                            >
                                ВЕСЬ СПИСОК
                            </button>
                        </div>
                    </TexturePanel>
                )}
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-sm font-medium">Последние достижения</h3>
                    <SpaceButton variant="outline" size="sm">
                        Посмотреть все
                    </SpaceButton>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {topAchievements.map((achievement) => (
                        <SpaceCard
                            key={achievement.id}
                            variant="glass"
                            className="achievement-card aspect-square flex flex-col items-center justify-center gap-2 text-center p-3"
                        >
                            <span className="text-xs uppercase tracking-[0.18em] text-space-cyan-300">
                                {achievement.category}
                            </span>
                            <p className="text-white text-sm font-semibold">
                                {achievement.title}
                            </p>
                            <p className="text-white/70 text-[10px] leading-tight">
                                {achievement.description}
                            </p>
                        </SpaceCard>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-sm font-medium">Статистика</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {overviewStats.map((stat) => (
                        <SpaceCard
                            key={stat.label}
                            variant="glass"
                            className="stat-card aspect-square flex flex-col items-center justify-center gap-1 text-center"
                        >
                            <span className="text-lg font-semibold text-white">{stat.value}</span>
                            <span className="text-xs uppercase tracking-wide text-space-cyan-300">
                                {stat.label}
                            </span>
                        </SpaceCard>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-sm font-medium">Последние миссии</h3>
                    <SpaceButton variant="outline" size="sm">
                        Посмотреть все
                    </SpaceButton>
                </div>
                <div className="space-y-2">
                    {missions.slice(0, 3).map((mission) => (
                        <SpaceCard
                            key={mission.id}
                            variant="glass"
                            className="p-3 flex items-center justify-between"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-white text-xs">{mission.title}</p>
                                <SpaceButton variant="outline" size="sm">
                                    Подробнее
                                </SpaceButton>
                            </div>
                        </SpaceCard>
                    ))}
                </div>
            </div>

            <div className="pb-20">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-sm font-medium">Последние артефакты</h3>
                    <SpaceButton variant="outline" size="sm">
                        Посмотреть все
                    </SpaceButton>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {topArtifacts.map((artifact) => (
                        <SpaceCard
                            key={artifact.id}
                            variant="glass"
                            className="aspect-square flex items-center justify-center text-center p-3"
                        >
                            <div className="space-y-1">
                                <p className="text-white text-xs font-semibold">{artifact.name}</p>
                                <p className="text-white/70 text-[10px] leading-tight">
                                    {artifact.description}
                                </p>
                            </div>
                        </SpaceCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default index;
