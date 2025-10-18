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
    isDashboardLoading: boolean;
    dashboardError: string | null;
    fetchDashboard: (force?: boolean) => Promise<void>;

    missionsEntries: MissionEntry[];
    missionStatusLabels: Record<MissionStatus, string>;
    missionFilterOptions: Array<{ value: string; label: string }>;
    missionsFilters: MissionFilterState;
    isMissionsLoading: boolean;
    missionsError: string | null;
    fetchMissionsPage: (force?: boolean) => Promise<void>;
    setMissionsFilters: (filters: Partial<MissionFilterState>) => void;
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

            // ---- a random exp
            let min = Math.ceil(0);
            userData.experience.current = Math.floor(Math.random() * (Math.floor(userData.experience.max) - min)) + min;
            // ----

            set({
                user: userData,
                missions: missionsData?.missions ?? [],
                achievements: achievementsData?.achievements ?? [],
                activity: activityData?.activity ?? [],
                artifacts: artifactsData?.artifacts ?? [],
                competencies: competenciesData?.competencies ?? [],
                statistics: statisticsData?.statistics ?? null,
                isDashboardLoading: false,
                dashboardError: null,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Не удалось загрузить данные";
            set({ dashboardError: message, isDashboardLoading: false });
        }
    },

    missionsEntries: [],
    missionStatusLabels: DEFAULT_STATUS_LABELS,
    missionFilterOptions: [{ value: "all", label: "Все компетенции" }],
    missionsFilters: DEFAULT_FILTERS,
    isMissionsLoading: false,
    missionsError: null,
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
}));

