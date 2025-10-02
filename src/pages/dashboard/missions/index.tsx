import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SpaceCard } from "@/components/ui/custom/space-card.tsx";
import { SpaceButton } from "@/components/ui/custom/space-button.tsx";
import { TexturePanel } from "@/components/ui/custom/texture-panel.tsx";
import type { MissionEntry, MissionStatus } from "@/types/missions.ts";
import { cn } from "@/lib/utils.ts";

type FilterState = {
    status: MissionStatus | "all";
    competencyId: string | "all";
};

type FilterSelectOption = {
    value: string;
    label: string;
};

type MissionsPageData = {
    statusLabels: Record<MissionStatus, string>;
    filterCompetencyOptions: FilterSelectOption[];
    entries: MissionEntry[];
};

const statusAccentStyles: Record<MissionStatus, string> = {
    available:
        "text-space-cyan-300 border-space-cyan-400/40 bg-space-blue-900/40",
    in_progress: "text-sky-200 border-sky-400/40 bg-space-blue-900/40",
    moderation: "text-amber-200 border-amber-400/40 bg-space-blue-900/40",
    completed: "text-emerald-300 border-emerald-400/40 bg-space-blue-900/40",
    locked: "text-red-300 border-red-400/40 bg-red-500/10",
};

const progressBarByStatus: Record<MissionStatus, string> = {
    available: "from-space-cyan-300 via-space-cyan-400 to-space-blue-700",
    in_progress: "from-sky-300 via-sky-400 to-sky-600",
    moderation: "from-amber-300 via-amber-400 to-amber-500",
    completed: "from-emerald-300 via-emerald-400 to-emerald-500",
    locked: "from-white/20 via-white/15 to-white/10",
};

const selectBaseStyles =
    "bg-space-blue-900/70 border border-white/10 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-space-cyan-400 focus:border-space-cyan-400";

const DEFAULT_STATUS_LABELS: Record<MissionStatus, string> = {
    available: "Доступно",
    in_progress: "Выполняется",
    moderation: "На проверке",
    completed: "Завершено",
    locked: "Недоступно",
};

const DEFAULT_COMPETENCY_OPTIONS: FilterSelectOption[] = [
    { value: "all", label: "Все компетенции" },
];

const Index = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [pageData, setPageData] = useState<MissionsPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [focusedMissionId, setFocusedMissionId] = useState<string | null>(null);
    const missionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

                const data = await fetchJson<MissionsPageData>(
                    "/data/missions-page.json",
                );

                if (controller.signal.aborted) {
                    return;
                }

                setPageData(data);
            } catch (loadError) {
                if (controller.signal.aborted) {
                    return;
                }
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Не удалось загрузить список миссий",
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

    const searchParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search],
    );

    const missionIdParam = searchParams.get("missionId") ?? undefined;
    const statusParam = searchParams.get("status");
    const competencyParam = searchParams.get("competencyId");

    const isValidStatus = (value: string | null): value is MissionStatus =>
        value !== null &&
        ["available", "in_progress", "moderation", "completed", "locked"].includes(
            value,
        );

    const filters: FilterState = {
        status: isValidStatus(statusParam) ? (statusParam as MissionStatus) : "all",
        competencyId:
            competencyParam && competencyParam !== "all" ? competencyParam : "all",
    };

    const missionEntries = pageData?.entries ?? [];
    const missionStatusLabels = pageData?.statusLabels ?? DEFAULT_STATUS_LABELS;
    const missionFilterCompetencyOptions =
        pageData?.filterCompetencyOptions ?? DEFAULT_COMPETENCY_OPTIONS;

    const missionFilterStatusOptions = useMemo(
        () => [
            { value: "all", label: "Все статусы" },
            ...Object.entries(missionStatusLabels).map(([value, label]) => ({
                value,
                label,
            })),
        ],
        [missionStatusLabels],
    );

    const visibleEntries = useMemo(() => {
        return missionEntries.filter((entry) => {
            if (entry.status === "locked") {
                return false;
            }

            if (filters.status !== "all" && entry.status !== filters.status) {
                return false;
            }

            return !(filters.competencyId !== "all" &&
                entry.competencyId !== filters.competencyId);
        });
    }, [filters, missionEntries]);

    useEffect(() => {
        if (!missionIdParam) {
            setFocusedMissionId(null);
            return;
        }

        setFocusedMissionId(missionIdParam);

        const target = missionRefs.current[missionIdParam];
        if (!target) {
            return;
        }

        const timeout = window.setTimeout(() => {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);

        return () => window.clearTimeout(timeout);
    }, [missionIdParam, visibleEntries.length]);

    const handleFilterChange = (
        key: "status" | "competencyId",
        value: string,
    ) => {
        const params = new URLSearchParams(location.search);
        if (value === "all" || value === "") {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        navigate(
            { pathname: location.pathname, search: params.toString() },
            { replace: false },
        );
    };

    const renderTasks = (entry: MissionEntry) => {
        return entry.tasks.map((task) => {
            const barWidth = Math.min(100, Math.max(0, task.progress));
            const isFocused = focusedMissionId === task.id;

            return (
                <div
                    key={task.id}
                    ref={(element) => {
                        if (element) {
                            missionRefs.current[task.id] = element;
                        } else {
                            delete missionRefs.current[task.id];
                        }
                    }}
                    className={cn(
                        "relative flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:gap-6",
                        {
                            "ring-2 ring-space-cyan-300 shadow-[0_0_18px_rgba(106,207,246,0.35)]":
                                isFocused,
                        },
                    )}
                >
                    <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{task.title}</p>
                        <p className="text-white/60 text-xs mt-1">
                            {missionStatusLabels[task.status] ?? task.status}
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/50">
                                <span>Прогресс</span>
                                <span>{barWidth}%</span>
                            </div>
                            <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-500 ease-out shadow-[0_0_12px_rgba(106,207,246,0.25)]",
                                        progressBarByStatus[task.status],
                                    )}
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                        <SpaceButton variant="outline" size="sm">
                            Подробнее
                        </SpaceButton>
                    </div>
                </div>
            );
        });
    };

    if (isLoading) {
        return (
            <SpaceCard className="p-6 text-center text-white/70 bg-space-blue-800/40 border border-white/10 backdrop-blur">
                Загружаем миссии...
            </SpaceCard>
        );
    }

    if (error) {
        return (
            <SpaceCard className="p-6 text-center text-red-300 bg-space-blue-800/40 border border-red-500/40">
                {error}
            </SpaceCard>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            <SpaceCard className="p-4 bg-space-blue-800/40 border border-white/10 backdrop-blur">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                            Статус
                        </span>
                        <select
                            className={selectBaseStyles}
                            value={filters.status}
                            onChange={(event) =>
                                handleFilterChange("status", event.target.value)
                            }
                        >
                            {missionFilterStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                            Компетенция
                        </span>
                        <select
                            className={selectBaseStyles}
                            value={filters.competencyId}
                            onChange={(event) =>
                                handleFilterChange("competencyId", event.target.value)
                            }
                        >
                            {missionFilterCompetencyOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </SpaceCard>

            <section className="space-y-4">
                {visibleEntries.length === 0 ? (
                    <SpaceCard className="p-6 text-center text-white/70">
                        Нет миссий, удовлетворяющих выбранным фильтрам.
                    </SpaceCard>
                ) : (
                    visibleEntries.map((entry) => {
                        const statusStyle = statusAccentStyles[entry.status];
                        const statusLabel = missionStatusLabels[entry.status] ?? entry.status;
                        return (
                            <TexturePanel
                                key={entry.id}
                                className="mission-panel"
                                contentClassName="p-4"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3 className="text-white text-base font-semibold">
                                            {entry.title}
                                        </h3>
                                        {entry.description ? (
                                            <p className="text-white/60 text-xs mt-1 max-w-2xl">
                                                {entry.description}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div
                                        className={cn(
                                            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]",
                                            statusStyle,
                                        )}
                                    >
                                        <span>{statusLabel}</span>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-3">{renderTasks(entry)}</div>
                            </TexturePanel>
                        );
                    })
                )}
            </section>
        </div>
    );
};

export default Index;
