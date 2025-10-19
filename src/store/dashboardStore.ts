import { create } from "zustand";
import {
    Achievement,
    Artifact,
    CompetencyItem,
    Mission,
    Statistics,
    User,
    UserActivity,
} from "@/types/dashboard";
import type { MissionEntry, MissionStatus } from "@/types/missions";

type MissionFilterState = {
    status: MissionStatus | "all";
    competencyId: "all" | string;
};

type MissionsPagePayload = {
    statusLabels: Record<MissionStatus, string>;
    filterCompetencyOptions: Array<{ value: string; label: string }>;
    entries: MissionEntry[];
};

type DashboardState = {
    user: User | null;
    missions: Mission[];
    achievements: Achievement[];
    activity: UserActivity[];
    artifacts: Artifact[];
    competencies: CompetencyItem[];
    statistics: Statistics | null;
    inventory: string[];
    isDashboardLoading: boolean;
    dashboardError: string | null;
    fetchDashboard: (force?: boolean) => Promise<void>;

    missionsEntries: MissionEntry[];
    missionsHistoryEntries: MissionEntry[];
    missionStatusLabels: Record<MissionStatus, string>;
    missionFilterOptions: Array<{ value: string; label: string }>;
    missionsFilters: MissionFilterState;
    isMissionsLoading: boolean;
    missionsError: string | null;
    fetchMissionsPage: (force?: boolean) => Promise<void>;
    setMissionsFilters: (filters: Partial<MissionFilterState>) => void;
    advanceMission: (missionId: string) => void;
    isMissionsHistoryLoading: boolean;
    missionsHistoryError: string | null;
    fetchMissionsHistory: (force?: boolean) => Promise<void>;
};

const DEFAULT_STATUS_LABELS: Record<MissionStatus, string> = {
    available: "Доступна",
    in_progress: "Выполняется",
    moderation: "На модерации",
    completed: "Завершена",
    locked: "Заблокирована",
};

const DEFAULT_FILTERS: MissionFilterState = {
    status: "all",
    competencyId: "all",
};

const fetchJson = async <T,>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Не удалось загрузить ${url}`);
    }
    return (await response.json()) as T;
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
    user: null,
    missions: [],
    achievements: [],
    activity: [],
    artifacts: [],
    competencies: [],
    statistics: null,
    inventory: [],
    isDashboardLoading: false,
    dashboardError: null,
    fetchDashboard: async (force = false) => {
        const { isDashboardLoading, user } = get();
        if (!force && (isDashboardLoading || user)) {
            return;
        }

        set({ isDashboardLoading: true, dashboardError: null });

        try {
            const [
                userData,
                missionsData,
                achievementsData,
                activityData,
                artifactsData,
                competenciesData,
                statisticsData,
            ] = await Promise.all([
                fetchJson<User>("/api/user"),
                fetchJson<{ missions: Mission[] }>("/api/missions"),
                fetchJson<{ achievements: Achievement[] }>("/api/achievements"),
                fetchJson<{ activity: UserActivity[] }>("/api/activity"),
                fetchJson<{ artifacts: Artifact[] }>("/api/artifacts"),
                fetchJson<{ competencies: CompetencyItem[] }>("/api/competencies"),
                fetchJson<{ statistics: Statistics }>("/api/statistics"),
            ]);

            set({
                user: userData,
                missions: missionsData?.missions ?? [],
                achievements: achievementsData?.achievements ?? [],
                activity: activityData?.activity ?? [],
                artifacts: artifactsData?.artifacts ?? [],
                competencies: competenciesData?.competencies ?? [],
                statistics: statisticsData?.statistics ?? null,
                inventory: [],
                isDashboardLoading: false,
                dashboardError: null,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Не удалось загрузить данные";
            set({ dashboardError: message, isDashboardLoading: false });
        }
    },

    missionsEntries: [],
    missionsHistoryEntries: [],
    missionStatusLabels: DEFAULT_STATUS_LABELS,
    missionFilterOptions: [{ value: "all", label: "Все компетенции" }],
    missionsFilters: DEFAULT_FILTERS,
    isMissionsLoading: false,
    missionsError: null,
    isMissionsHistoryLoading: false,
    missionsHistoryError: null,
    fetchMissionsPage: async (force = false) => {
        const { isMissionsLoading, missionsFilters } = get();
        if (!force && isMissionsLoading) {
            return;
        }

        set({ isMissionsLoading: true, missionsError: null });

        try {
            const params = new URLSearchParams();
            if (missionsFilters.status !== "all") {
                params.set("status", missionsFilters.status);
            }
            if (missionsFilters.competencyId !== "all") {
                params.set("competencyId", missionsFilters.competencyId);
            }

            const query = params.toString();
            const payload = await fetchJson<MissionsPagePayload>(
                `/api/missions/page${query ? `?${query}` : ""}`,
            );

            set({
                missionsEntries: payload.entries,
                missionStatusLabels: { ...DEFAULT_STATUS_LABELS, ...payload.statusLabels },
                missionFilterOptions: payload.filterCompetencyOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                })),
                isMissionsLoading: false,
                missionsError: null,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Не удалось загрузить миссии";
            set({ missionsError: message, isMissionsLoading: false });
        }
    },
    fetchMissionsHistory: async (force = false) => {
        const { isMissionsHistoryLoading, missionsHistoryEntries } = get();
        if (!force && (isMissionsHistoryLoading || missionsHistoryEntries.length > 0)) {
            return;
        }

        set({ isMissionsHistoryLoading: true, missionsHistoryError: null });

        try {
            const payload = await fetchJson<MissionsPagePayload>("/api/missions/page?status=completed");

            set({
                missionsHistoryEntries: payload.entries,
                isMissionsHistoryLoading: false,
                missionsHistoryError: null,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Не удалось загрузить историю миссий";
            set({ missionsHistoryError: message, isMissionsHistoryLoading: false });
        }
    },
    setMissionsFilters: (filters) => {
        const currentFilters = get().missionsFilters;
        const nextFilters: MissionFilterState = {
            ...currentFilters,
            ...filters,
        };

        const hasChanged =
            currentFilters.status !== nextFilters.status || currentFilters.competencyId !== nextFilters.competencyId;

        if (!hasChanged) {
            return;
        }

        set({ missionsFilters: nextFilters });
        void get().fetchMissionsPage(true);
    },
    advanceMission: (missionId) => {
        const state = get();

        let rewardCurrency = 0;
        let rewardExperience = 0;
        let rewardItems: string[] = [];
        let affectedCompetencies: string[] = [];
        let didComplete = false;

        const updateTaskStatus = (status: MissionStatus): MissionStatus => {
            if (status === "locked" || status === "completed") {
                return status;
            }

            if (status === "moderation") {
                didComplete = true;
                return "completed";
            }

            if (status === "in_progress") {
                return "moderation";
            }

            return "in_progress";
        };

        const computeEntryStatus = (tasks: MissionEntry["tasks"]): MissionStatus => {
            if (tasks.every((task) => task.status === "completed")) {
                return "completed";
            }
            if (tasks.some((task) => task.status === "moderation")) {
                return "moderation";
            }
            if (tasks.some((task) => task.status === "in_progress")) {
                return "in_progress";
            }
            if (tasks.some((task) => task.status === "available")) {
                return "available";
            }
            return "locked";
        };

        let nextStatus: MissionStatus | null = null;
        const completedEntries: MissionEntry[] = [];

        const updatedEntries = state.missionsEntries.reduce<MissionEntry[]>((acc, entry) => {
            let entryChanged = false;

            const tasks = entry.tasks.map((task) => {
                if (task.id !== missionId) {
                    return task;
                }

                const status = updateTaskStatus(task.status);
                if (status === task.status) {
                    return task;
                }

                entryChanged = true;
                nextStatus = status;

                if (status === "completed") {
                    rewardCurrency = task.reward?.currency ?? task.reward?.xp ?? 0;
                    rewardExperience = task.reward?.xp ?? 0;
                    rewardItems = Array.isArray(task.reward?.items) ? task.reward?.items ?? [] : [];
                    const taskCompetencies = Array.isArray(task.competencyIds) && task.competencyIds.length > 0
                        ? task.competencyIds
                        : task.competencyId !== undefined
                          ? [task.competencyId]
                          : [];
                    const entryCompetencies = Array.isArray(entry.competencyIds) && entry.competencyIds.length > 0
                        ? entry.competencyIds
                        : entry.competencyId !== undefined
                          ? [entry.competencyId]
                          : [];
                    affectedCompetencies = [...taskCompetencies, ...entryCompetencies].map((value) => String(value));
                }

                return {
                    ...task,
                    status,
                    progress: status === "completed" ? 100 : task.progress,
                    completedDate: status === "completed" ? new Date().toISOString() : task.completedDate,
                };
            });

            if (!entryChanged) {
                acc.push(entry);
                return acc;
            }

            const entryStatus = computeEntryStatus(tasks);
            const updatedEntry = {
                ...entry,
                tasks,
                status: entryStatus,
            };

            if (entryStatus === "completed") {
                completedEntries.push(updatedEntry);
                return acc;
            }

            acc.push(updatedEntry);
            return acc;
        }, []);

        if (!nextStatus) {
            return;
        }

        const updatedMissions = state.missions.map((mission) => {
            if (mission.id !== missionId) {
                return mission;
            }
            return {
                ...mission,
                status: nextStatus ?? mission.status,
                progress: nextStatus === "completed" ? 100 : mission.progress,
                completedDate: nextStatus === "completed" ? new Date().toISOString() : mission.completedDate,
            };
        });

        let updatedUser = state.user;
        let updatedStatistics = state.statistics;

        if (didComplete && state.user) {
            const currencyAmount = state.user.currency.amount + rewardCurrency;
            let currentExperience = state.user.experience.current + rewardExperience;
            let { max } = state.user.experience;
            let level = state.user.level;

            while (currentExperience >= max) {
                currentExperience -= max;
                level += 1;
            }

            updatedUser = {
                ...state.user,
                currency: {
                    ...state.user.currency,
                    amount: currencyAmount,
                },
                experience: {
                    current: currentExperience,
                    max,
                },
                level,
                tasks: {
                    ...state.user.tasks,
                    completed: state.user.tasks.completed + 1,
                },
            };

            if (updatedStatistics?.overview) {
                updatedStatistics = {
                    ...updatedStatistics,
                    overview: {
                        ...updatedStatistics.overview,
                        completedMissions: updatedStatistics.overview.completedMissions + 1,
                        totalExperience: updatedStatistics.overview.totalExperience + rewardExperience,
                    },
                    weekly: updatedStatistics.weekly
                        ? {
                              ...updatedStatistics.weekly,
                              missionsCompleted: updatedStatistics.weekly.missionsCompleted + 1,
                              experienceGained: updatedStatistics.weekly.experienceGained + rewardExperience,
                          }
                        : undefined,
                };
            }
        }

        const competencySet = new Set(affectedCompetencies);
        const updatedCompetencies = state.competencies.map((competency) => {
            if (!competencySet.has(String(competency.id))) {
                return competency;
            }

            let value = competency.value + 1;
            let level = competency.level ?? 1;

            while (value > competency.max) {
                value -= competency.max;
                level += 1;
            }

            return {
                ...competency,
                value,
                level,
            };
        });

        const updatedInventory = rewardItems.length > 0 ? state.inventory.concat(rewardItems.map((item) => String(item))) : state.inventory;

        const historyById = new Map(state.missionsHistoryEntries.map((entry) => [entry.id, entry] as const));
        for (const entry of completedEntries) {
            historyById.set(entry.id, entry);
        }

        set({
            missionsEntries: updatedEntries,
            missionsHistoryEntries: Array.from(historyById.values()),
            missions: updatedMissions,
            user: updatedUser,
            competencies: updatedCompetencies,
            statistics: updatedStatistics,
            inventory: updatedInventory,
        });
    },
}));
