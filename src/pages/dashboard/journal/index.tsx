import { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./Journal.module.css";

interface JournalTabConfig {
    value: string;
    label: string;
    to: string;
}

const tabs: JournalTabConfig[] = [
    { value: "history", label: "История активности", to: "history" },
    { value: "artifacts", label: "Артефакты", to: "artifacts" },
    { value: "rating", label: "Рейтинг", to: "rating" },
    { value: "statistics", label: "Статистика", to: "statistics" },
];

const getActiveTab = (pathname: string): string => {
    if (pathname.includes("/journal/artifacts")) {
        return "artifacts";
    }
    if (pathname.includes("/journal/rating")) {
        return "rating";
    }
    if (pathname.includes("/journal/statistics")) {
        return "statistics";
    }
    return "history";
};

const DashboardJournal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const scrollerRef = useRef<HTMLDivElement>(null);

    const activeTab = useMemo(() => getActiveTab(location.pathname), [location.pathname]);

    useEffect(() => {
        if (!activeTab) {
            return;
        }

        const scroller = scrollerRef.current;
        if (!scroller) {
            return;
        }

        const button = scroller.querySelector<HTMLButtonElement>(`[data-value="${activeTab}"]`);
        if (!button) {
            return;
        }

        button.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }, [activeTab]);

    return (
        <div className={styles.root}>
            <div className={styles.tabsContainer}>
                <div className={styles.tabsScroller} role="tablist" aria-label="Навигация боевого журнала" ref={scrollerRef}>
                    {tabs.map((tab) => {
                        const isActive = tab.value === activeTab;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                className={clsx(styles.tabButton, isActive && styles.tabButtonActive)}
                                data-value={tab.value}
                                onClick={() => navigate(tab.to)}
                                role="tab"
                                aria-selected={isActive}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardJournal;
