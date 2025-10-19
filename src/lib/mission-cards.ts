import type {
    MissionEntry,
    MissionStatus as EntryMissionStatus,
    MissionTask,
} from "@/types/missions";
import type {
    MissionProps,
    MissionStatus as CardMissionStatus,
} from "@/components/dashboard/missions/dashboard-mission-card";

const missionStatusMap: Record<EntryMissionStatus, CardMissionStatus> = {
    available: "available",
    in_progress: "progress",
    moderation: "moderation",
    completed: "complete",
    locked: "locked",
};

type MissionCardOptions = {
    filterStatuses?: EntryMissionStatus[];
};

export const collectCompetencyIds = (entry: MissionEntry, task: MissionTask): string[] => {
    const entryCompetencies = Array.isArray(entry.competencyIds)
        ? entry.competencyIds
        : entry.competencyId !== undefined
          ? [entry.competencyId]
          : [];
    const taskCompetencies = Array.isArray(task.competencyIds)
        ? task.competencyIds
        : task.competencyId !== undefined
          ? [task.competencyId]
          : [];

    const combined = [...entryCompetencies, ...taskCompetencies].filter(
        (value): value is string | number => value !== undefined && value !== null,
    );
    return Array.from(new Set(combined.map((value) => String(value))));
};

export const mapMissionTaskToCard = (entry: MissionEntry, task: MissionTask): MissionProps => {
    const rewardXp = task.reward?.xp ?? 0;
    const rewardCurrency = task.reward?.currency ?? rewardXp;

    return {
        id: task.id,
        title: task.title,
        status: missionStatusMap[task.status] ?? "available",
        mana: rewardCurrency,
        exp: rewardXp,
        competencies: task.competencyIds,
        completedDate: task.completedDate,
    };
};

export const mapEntryToMissionCards = (entry: MissionEntry, options: MissionCardOptions = {}): MissionProps[] => {
    const { filterStatuses } = options;
    const statusFilter = filterStatuses ? new Set(filterStatuses) : null;

    return entry.tasks
        .filter((task) => (statusFilter ? statusFilter.has(task.status) : true))
        .map((task) => mapMissionTaskToCard(entry, task));
};

export const mapEntriesToMissionCards = (
    entries: MissionEntry[],
    options: MissionCardOptions = {},
): MissionProps[] => {
    return entries.flatMap((entry) => mapEntryToMissionCards(entry, options));
};

export const missionStatusToCardStatus = missionStatusMap;
