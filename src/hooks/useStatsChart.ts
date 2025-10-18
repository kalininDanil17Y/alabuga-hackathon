import { useMemo } from "react";
import type { Statistics } from "@/types/dashboard";

interface DayConfig {
    key: string;
    label: string;
    title: string;
}

const DAY_CONFIG: DayConfig[] = [
    { key: "mon", label: "пн", title: "понедельник" },
    { key: "tue", label: "вт", title: "вторник" },
    { key: "wed", label: "ср", title: "среда" },
    { key: "thu", label: "чт", title: "четверг" },
    { key: "fri", label: "пт", title: "пятница" },
    { key: "sat", label: "сб", title: "суббота" },
    { key: "sun", label: "вс", title: "воскресенье" },
];

const MISSION_DISTRIBUTION = [0.8, 1.6, 1.1, 0.9, 1.3, 1.0, 1.2];
const EXPERIENCE_DISTRIBUTION = [0.6, 1.1, 0.9, 1.0, 1.4, 0.8, 0.7];

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

const normalize = (value: number, maxValue: number): number => {
    if (maxValue <= 0) {
        return 0;
    }
    return Number(((value / maxValue) * 10).toFixed(2));
};

export interface StatsChartPoint {
    key: string;
    label: string;
    dayTitle: string;
    barValue: number;
    lineValue: number;
    missions: number;
    experience: number;
}

export const useStatsChart = (statistics?: Statistics | null): StatsChartPoint[] => {
    return useMemo(() => {
        if (!statistics) {
            return [];
        }

        const totalMissions = statistics.weekly?.missionsCompleted ?? statistics.overview?.completedMissions ?? 0;
        const totalExperience = statistics.weekly?.experienceGained ?? statistics.overview?.totalExperience ?? 0;

        const missionBase = sum(MISSION_DISTRIBUTION) || 1;
        const experienceBase = sum(EXPERIENCE_DISTRIBUTION) || 1;

        const missionValues = MISSION_DISTRIBUTION.map((weight) => (totalMissions / missionBase) * weight);
        const experienceValues = EXPERIENCE_DISTRIBUTION.map((weight) => (totalExperience / experienceBase) * weight);

        const maxMissionValue = Math.max(...missionValues, 1);
        const maxExperienceValue = Math.max(...experienceValues, 1);

        return DAY_CONFIG.map((config, index) => {
            const missions = Math.max(0, Math.round(missionValues[index] ?? 0));
            const experience = Math.max(0, Math.round(experienceValues[index] ?? 0));

            return {
                key: config.key,
                label: config.label,
                dayTitle: config.title,
                barValue: normalize(missionValues[index] ?? 0, maxMissionValue),
                lineValue: normalize(experienceValues[index] ?? 0, maxExperienceValue),
                missions,
                experience,
            };
        });
    }, [statistics]);
};
