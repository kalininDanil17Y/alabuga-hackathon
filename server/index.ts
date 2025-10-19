import express from "express";
import cors from "cors";
import path from "node:path";
import { readFileSync } from "node:fs";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";
const dataDir = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "public", "data"));

app.use(cors());
app.use(express.json());

const loadJson = (fileName: string) => {
    const filePath = path.join(dataDir, fileName);
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
};

const missionsPageData = loadJson("missions-page.json");
const competenciesData = loadJson("competencies.json");
const userData = loadJson("user.json");
const achievementsData = loadJson("achievements.json");
const activityData = loadJson("activity.json");
const artifactsData = loadJson("artifacts.json");
const statisticsData = loadJson("statistics.json");


const missionStatusOrder = ["available", "in_progress", "moderation", "completed", "locked"] as const;

type MissionStatusKey = typeof missionStatusOrder[number];

type SortableItem = {
    status: string;
    title: string;
};

type MissionPageEntry = (typeof missionsPageData)["entries"][number];
type MissionTask = MissionPageEntry["tasks"][number];

type MissionSummary = {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    priority: string;
    category: string;
    xpReward: number;
    completedDate?: string;
    competencyId?: string | number;
    competencyIds?: Array<string | number>;
};

const statusRank = (status: string): number => {
    const index = missionStatusOrder.indexOf(status as MissionStatusKey);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const sortEntries = <T extends SortableItem>(items: T[]): T[] => {
    return items.slice().sort((a, b) => {
        const statusDiff = statusRank(a.status) - statusRank(b.status);
        if (statusDiff !== 0) {
            return statusDiff;
        }
        return a.title.localeCompare(b.title, "ru");
    });
};

const sortTasks = (tasks: MissionTask[]): MissionTask[] => sortEntries(tasks);

const buildMissionSummary = (entries: MissionPageEntry[]): MissionSummary[] => {
    const featuredTasks: MissionSummary[] = [];

    entries.forEach((entry) => {
        entry.tasks.forEach((task) => {
            if (!("isFeatured" in task) || task.isFeatured !== true) {
                return;
            }

            const competencyIds = (
                Array.isArray(task.competencyIds) && task.competencyIds.length > 0
                    ? task.competencyIds
                    : Array.isArray(entry.competencyIds)
                      ? entry.competencyIds
                      : task.competencyId
                        ? [task.competencyId]
                        : entry.competencyId
                          ? [entry.competencyId]
                          : []
            ).map((value) => (typeof value === "string" ? value : String(value)));

            const [primaryCompetency] = competencyIds;

            featuredTasks.push({
                id: task.id,
                title: task.title,
                description: task.description ?? entry.description ?? task.title,
                status: task.status,
                progress: typeof task.progress === "number" ? task.progress : 0,
                priority: typeof task.priority === "string" ? task.priority : "medium",
                category: typeof task.category === "string" ? task.category : entry.id,
                xpReward: task.reward?.xp ?? 0,
                completedDate: task.completedDate,
                competencyId: primaryCompetency,
                competencyIds,
            });
        });
    });

    return sortEntries(featuredTasks);
};

app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/healthz", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/user", (_req, res) => {
    res.json(userData);
});

app.get("/api/competencies", (_req, res) => {
    res.json(competenciesData);
});

app.get("/api/achievements", (_req, res) => {
    res.json(achievementsData);
});

app.get("/api/activity", (_req, res) => {
    res.json(activityData);
});

app.get("/api/artifacts", (_req, res) => {
    res.json(artifactsData);
});

app.get("/api/statistics", (_req, res) => {
    res.json(statisticsData);
});

app.get("/api/missions", (_req, res) => {
    const missions = buildMissionSummary(missionsPageData.entries);
    res.json({ missions });
});

app.get("/api/missions/page", (req, res) => {
    const { status = "all", competencyId = "all" } = req.query;
    const competencyFilter = String(competencyId);

    const filteredEntries = missionsPageData.entries
        .filter((entry: MissionPageEntry) => status === "all" || entry.status === status)
        .map((entry: MissionPageEntry) => {
            const matchesCompetency = (task: MissionTask): boolean => {
                if (competencyFilter === "all") {
                    return true;
                }

                const taskCompetencies = Array.isArray(task.competencyIds)
                    ? task.competencyIds
                    : task.competencyId
                      ? [task.competencyId]
                      : [];
                const entryCompetencies = Array.isArray(entry.competencyIds)
                    ? entry.competencyIds
                    : entry.competencyId
                      ? [entry.competencyId]
                      : [];

                const combined = taskCompetencies.length > 0 ? taskCompetencies : entryCompetencies;

                return combined.some((value) => String(value) === competencyFilter);
            };

            const visibleTasks = entry.tasks.filter((task) => {
                if (task.status === "locked") {
                    return false;
                }

                return matchesCompetency(task);
            });

            const sortedVisibleTasks = sortTasks(visibleTasks);

            return {
                ...entry,
                tasks: sortedVisibleTasks,
            };
        })
        .filter((entry) => {
            if (entry.tasks.length === 0) {
                return false;
            }

            return entry.tasks.some((task) => task.status !== "completed");
        });

    const sortedEntries = sortEntries(filteredEntries);

    res.json({
        statusLabels: missionsPageData.statusLabels,
        filterCompetencyOptions: missionsPageData.filterCompetencyOptions.map((option: { value: string | number; label: string }) => ({
            ...option,
            value: String(option.value),
        })),
        entries: sortedEntries,
    });
});

app.listen(PORT, HOST, () => {
    console.log(`API server listening on http://${HOST}:${PORT}`);
});
