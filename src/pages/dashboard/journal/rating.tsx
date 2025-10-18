import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HorizontalRule } from "@/components/ui/custom/horizontal-rule.tsx";
import { TimeRangeSwitch } from "@/components/ui/custom/time-range-switch.tsx";
import type { TimeRangeOption } from "@/components/ui/custom/time-range-switch.tsx";
import styles from "./Rating.module.css";

type LeaderboardPeriod = "week" | "month" | "year";

type LeaderboardTrend = "up" | "down" | "same" | "new";

interface LeaderboardEntry {
    id: string;
    rank: number;
    name: string;
    role: string;
    score: number;
    unit: string;
    trend?: LeaderboardTrend;
    isHighlighted?: boolean;
}

const periodOptions: TimeRangeOption[] = [
    { value: "week", label: "За неделю" },
    { value: "month", label: "За месяц" },
    { value: "year", label: "За год" },
];

const leaderboardData: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
    week: [
        { id: "1", rank: 1, name: "Маруся", role: "Разведчик ур3", score: 2150, unit: "чего-то", trend: "up" },
        { id: "2", rank: 2, name: "Обезьянка 2000", role: "Искатель ур3", score: 2040, unit: "чего-то", trend: "up" },
        { id: "3", rank: 3, name: "Обезьянка 2000", role: "Искатель ур3", score: 2000, unit: "чего-то", trend: "up", isHighlighted: true },
        { id: "4", rank: 4, name: "Обезьянка 2000", role: "Искатель ур3", score: 1980, unit: "чего-то", trend: "down" },
        { id: "5", rank: 5, name: "Обезьянка 2000", role: "Искатель ур3", score: 1950, unit: "чего-то", trend: "down" },
        { id: "6", rank: 6, name: "Обезьянка 2000", role: "Искатель ур3", score: 1930, unit: "чего-то" },
        { id: "7", rank: 7, name: "Обезьянка 2000", role: "Искатель ур3", score: 1900, unit: "чего-то", trend: "up" },
        { id: "8", rank: 8, name: "Обезьянка 2000", role: "Искатель ур3", score: 1890, unit: "чего-то" },
    ],
    month: [
        { id: "1", rank: 1, name: "Маруся", role: "Разведчик ур3", score: 8650, unit: "чего-то", trend: "up" },
        { id: "2", rank: 2, name: "КосмоКот", role: "Пилот ур4", score: 8420, unit: "чего-то", trend: "same" },
        { id: "3", rank: 3, name: "Искра", role: "Аналитик ур3", score: 8320, unit: "чего-то", trend: "up" },
        { id: "4", rank: 4, name: "Обезьянка 2000", role: "Искатель ур3", score: 8290, unit: "чего-то", trend: "down", isHighlighted: true },
        { id: "5", rank: 5, name: "Фотон", role: "Механик ур2", score: 8210, unit: "чего-то", trend: "down" },
        { id: "6", rank: 6, name: "Китобот", role: "Навигатор ур2", score: 8180, unit: "чего-то" },
        { id: "7", rank: 7, name: "Туманность", role: "Исследователь ур1", score: 8120, unit: "чего-то", trend: "up" },
        { id: "8", rank: 8, name: "Гравитация", role: "Инженер ур1", score: 8090, unit: "чего-то" },
    ],
    year: [
        { id: "1", rank: 1, name: "КосмоКот", role: "Пилот ур4", score: 102_400, unit: "чего-то", trend: "up" },
        { id: "2", rank: 2, name: "Маруся", role: "Разведчик ур3", score: 101_580, unit: "чего-то", trend: "same" },
        { id: "3", rank: 3, name: "Обезьянка 2000", role: "Искатель ур3", score: 99_320, unit: "чего-то", trend: "up", isHighlighted: true },
        { id: "4", rank: 4, name: "Искра", role: "Аналитик ур3", score: 98_910, unit: "чего-то", trend: "down" },
        { id: "5", rank: 5, name: "Фотон", role: "Механик ур2", score: 97_680, unit: "чего-то", trend: "down" },
        { id: "6", rank: 6, name: "Китобот", role: "Навигатор ур2", score: 96_320, unit: "чего-то", trend: "same" },
        { id: "7", rank: 7, name: "Туманность", role: "Исследователь ур1", score: 95_840, unit: "чего-то", trend: "up" },
        { id: "8", rank: 8, name: "Гравитация", role: "Инженер ур1", score: 94_760, unit: "чего-то" },
    ],
};

const trendIconMap: Record<LeaderboardTrend, LucideIcon> = {
    up: ArrowUp,
    down: ArrowDown,
    same: Minus,
    new: ArrowUpRight,
};

const trendClassMap: Record<LeaderboardTrend, string> = {
    up: styles.trendUp,
    down: styles.trendDown,
    same: styles.trendSame,
    new: styles.trendNew,
};

const formatScore = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

const isPeriod = (value: string): value is LeaderboardPeriod =>
    periodOptions.some((option) => option.value === value);

const DashboardJournalRating: React.FC = () => {
    const [period, setPeriod] = useState<LeaderboardPeriod>("week");

    const entries = useMemo(() => leaderboardData[period] ?? [], [period]);

    return (
        <div className={styles.root}>
            <HorizontalRule paddingX="6px" />

            <TimeRangeSwitch
                label="Сортировка по времени"
                options={periodOptions}
                value={period}
                onChange={(nextValue) => {
                    if (isPeriod(nextValue)) {
                        setPeriod(nextValue);
                    }
                }}
            />

            {entries.length === 0 ? (
                <div className={styles.placeholderCard}>
                    <span className={styles.emptyTitle}>Лидерборд пока пуст</span>
                    <span className={styles.emptySubtitle}>Завершайте миссии и возвращайтесь за наградой!</span>
                </div>
            ) : (
                <div className={styles.list}>
                    {entries.map((entry) => {
                        const trend = entry.trend;
                        const Icon = trend ? trendIconMap[trend] : null;

                        return (
                            <div
                                key={entry.id}
                                className={styles.entry}
                                data-highlighted={entry.isHighlighted ? "true" : "false"}
                            >
                                <div className={styles.entryLeft}>
                                    <span
                                        className={clsx(
                                            styles.trendIcon,
                                            trend ? trendClassMap[trend] : styles.trendPlaceholder,
                                        )}
                                        aria-hidden="true"
                                    >
                                        {Icon ? <Icon size={16} strokeWidth={3} /> : null}
                                    </span>
                                    <span className={styles.rankNumber}>{entry.rank}</span>
                                </div>

                                <div className={styles.player}>
                                    <span className={styles.playerName}>{entry.name}</span>
                                    <span className={styles.playerSubtitle}>{entry.role}</span>
                                </div>

                                <div className={styles.score}>
                                    <span className={styles.scoreValue}>{formatScore(entry.score)}</span>
                                    <span className={styles.scoreUnit}>{entry.unit}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DashboardJournalRating;
