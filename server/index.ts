import express from "express";
import cors from "cors";
import path from "node:path";
import { readFileSync } from "node:fs";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

const dataDir = path.join(process.cwd(), "public", "data");

const loadJson = <T,>(fileName: string): T => {
    const filePath = path.join(dataDir, fileName);
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
};

const missionsList = loadJson<{ missions: unknown[] }>("missions.json");
const missionsPageData = loadJson<{
    statusLabels: Record<string, string>;
    filterCompetencyOptions: Array<{ value: string | number; label: string }>;
    entries: Array<{
        id: string;
        title: string;
        description?: string;
        status: string;
        type: "chain" | "single";
        competencyId?: number | string;
        tasks: Array<{
            id: string;
            title: string;
            status: string;
            progress: number;
            competencyId?: number | string;
            reward?: { xp?: number; currency?: number };
        }>;
    }>;
}>("missions-page.json");
const competenciesData = loadJson<{ competencies: unknown[] }>("competencies.json");
const userData = loadJson<Record<string, unknown>>("user.json");

const missionStatusOrder = ["available", "in_progress", "moderation", "completed", "locked"] as const;

const statusRank = (status: string): number => {
    const index = missionStatusOrder.indexOf(status as typeof missionStatusOrder[number]);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const sortEntries = <T extends { status: string; title: string }>(items: T[]): T[] => {
    return items.slice().sort((a, b) => {
        const statusDiff = statusRank(a.status) - statusRank(b.status);
        if (statusDiff !== 0) {
            return statusDiff;
        }
        return a.title.localeCompare(b.title, "ru");
    });
};

app.get("/api/user", (_req, res) => {
    res.json(userData);
});

app.get("/api/competencies", (_req, res) => {
    res.json(competenciesData);
});

app.get("/api/missions", (_req, res) => {
    res.json(missionsList);
});

app.get("/api/missions/page", (req, res) => {
    const { status = "all", competencyId = "all" } = req.query;

    const filteredEntries = missionsPageData.entries.filter((entry) => {
        const matchesStatus = status === "all" || entry.status === status;
        const matchesCompetency =
            competencyId === "all" || String(entry.competencyId ?? "") === String(competencyId);
        return matchesStatus && matchesCompetency;
    }).map((entry) => ({
        ...entry,
        tasks: sortEntries(entry.tasks),
    }));

    const sortedEntries = sortEntries(filteredEntries);

    res.json({
        statusLabels: missionsPageData.statusLabels,
        filterCompetencyOptions: missionsPageData.filterCompetencyOptions.map((option) => ({
            ...option,
            value: String(option.value),
        })),
        entries: sortedEntries,
    });
});

app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
});
