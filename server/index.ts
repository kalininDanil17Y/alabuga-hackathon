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
    deadline?: string;
    category: string;
    xpReward: number;
    completedDate?: string;
    competencyId?: string | number;
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

            featuredTasks.push({
                id: task.id,
                title: task.title,
                description: task.description ?? entry.description ?? task.title,
                status: task.status,
                progress: typeof task.progress === "number" ? task.progress : 0,
                priority: typeof task.priority === "string" ? task.priority : "medium",
                deadline: task.deadline,
                category: typeof task.category === "string" ? task.category : entry.id,
                xpReward: task.reward?.xp ?? 0,
                completedDate: task.completedDate,
                competencyId: task.competencyId ?? entry.competencyId,
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

    const filteredEntries = missionsPageData.entries
        .filter((entry: { status: string; competencyId?: number | string }) => {
            const matchesStatus = status === "all" || entry.status === status;
            const matchesCompetency = competencyId === "all" || String(entry.competencyId ?? "") === String(competencyId);
            return matchesStatus && matchesCompetency;
        })
        .map((entry: { tasks: Array<{ status: string; title: string }>; [key: string]: unknown }) => ({
            ...entry,
            tasks: sortTasks(entry.tasks),
        }));

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
