import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import type { TooltipProps } from "recharts";
import { SpaceCard } from "@/components/ui/custom/space-card";
import { useDashboardStore } from "@/store/dashboardStore";
import { useStatsChart } from "@/hooks/useStatsChart";
import styles from "./Statistics.module.css";

interface TooltipPayload {
    missions: number;
    experience: number;
    dayTitle: string;
}

const numberFormatter = new Intl.NumberFormat("ru-RU");

const formatNumber = (value?: number | null) => numberFormatter.format(Math.max(0, Math.round(value ?? 0)));

const formatDuration = (joinDate?: string, lastActivity?: string) => {
    if (!joinDate || !lastActivity) {
        return "—";
    }

    const start = new Date(joinDate);
    const end = new Date(lastActivity);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return "—";
    }

    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

    if (diffDays > 0) {
        return `${diffDays} д. ${diffHours} ч.`;
    }

    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    if (diffHours > 0) {
        return `${diffHours} ч. ${diffMinutes} мин.`;
    }

    return `${Math.max(1, diffMinutes)} мин.`;
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload as TooltipPayload | undefined;

    if (!data) {
        return null;
    }

    return (
        <div className={styles.chartTooltip}>
            <div className={styles.chartTooltipLabel}>Активность, {data.dayTitle}</div>
            <div>Миссии: {formatNumber(data.missions)}</div>
            <div>Опыт: {formatNumber(data.experience)}</div>
        </div>
    );
};

const DashboardJournalStatistics = () => {
    const { statistics, isDashboardLoading, user } = useDashboardStore((state) => ({
        statistics: state.statistics,
        isDashboardLoading: state.isDashboardLoading,
        user: state.user,
    }));

    const chartData = useStatsChart(statistics);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [statistics?.overview?.completedMissions, statistics?.weekly?.missionsCompleted]);

    const activePoint = chartData[activeIndex] ?? chartData[0];

    const metrics = useMemo(() => {
        if (!statistics) {
            return [];
        }

        return [
            {
                id: "missions",
                title: "Общее количество миссий",
                subtitle: "За весь период",
                value: formatNumber(statistics.overview?.completedMissions ?? statistics.overview?.totalMissions),
            },
            {
                id: "experience",
                title: "Накопленный опыт",
                subtitle: "Суммарно",
                value: formatNumber(statistics.overview?.totalExperience),
            },
            {
                id: "currency",
                title: "Заработанная мана",
                subtitle: "Внутренняя валюта",
                value: `${formatNumber(user?.currency.amount)} ${user?.currency.symbol ?? ""}`.trim(),
            },
            {
                id: "time",
                title: "Всего времени в системе",
                subtitle: "С момента входа",
                value: formatDuration(user?.joinDate, user?.lastActivity),
            },
        ];
    }, [statistics, user?.currency.amount, user?.currency.symbol, user?.joinDate, user?.lastActivity]);

    if (isDashboardLoading && !statistics) {
        return (
            <SpaceCard variant="glass" className={styles.emptyCard}>
                <p className={styles.emptyMessage}>Загружаем статистику...</p>
            </SpaceCard>
        );
    }

    if (!statistics) {
        return (
            <SpaceCard variant="glass" className={styles.emptyCard}>
                <p className={styles.emptyMessage}>Статистические данные пока недоступны.</p>
            </SpaceCard>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.chartCard}>
                <div className={styles.header}>
                    <h2 className={styles.title}>График прогресса по времени</h2>
                    <span className={styles.subtitle}>Сортировка по времени</span>
                </div>
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 12, right: 8, bottom: 8, left: 8 }}>
                            <CartesianGrid stroke="rgba(86, 168, 255, 0.18)" strokeDasharray="3 6" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9fd6ff" }} axisLine={false} tickLine={false} />
                            <YAxis hide domain={[0, 10]} />
                            <Tooltip cursor={{ fill: "rgba(55, 160, 255, 0.12)" }} content={<CustomTooltip />} />
                            <Bar dataKey="barValue" barSize={16} radius={[10, 10, 4, 4]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={entry.key}
                                        cursor="pointer"
                                        fill={index === activeIndex ? "#64d8ff" : "#1fa6ff"}
                                        onClick={() => setActiveIndex(index)}
                                    />
                                ))}
                            </Bar>
                            <Line
                                type="monotone"
                                dataKey="lineValue"
                                stroke="#8fd6ff"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: "#ffffff", stroke: "#8fd6ff", strokeWidth: 2 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                {activePoint ? (
                    <div className={styles.activeSummary}>
                        <div className={styles.activeSummaryLabel}>
                            <span>Выбранный день</span>
                            <span>{activePoint.dayTitle}</span>
                        </div>
                        <div className={styles.activeSummaryValue}>
                            <div>Миссии: {formatNumber(activePoint.missions)}</div>
                            <div>Опыт: {formatNumber(activePoint.experience)}</div>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className={styles.metricsCard}>
                {metrics.map((metric) => (
                    <div key={metric.id} className={styles.metricRow}>
                        <div className={styles.metricLabel}>
                            <span>{metric.title}</span>
                            <span>{metric.subtitle}</span>
                        </div>
                        <div className={styles.metricValue}>{metric.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardJournalStatistics;

