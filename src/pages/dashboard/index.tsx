import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { DashboardHeader, DashboardBottomNav } from "@/components/dashboard/layout";
import { useDashboardStore } from "@/store/dashboardStore";
import styles from "./Dashboard.module.css";
import {number_format} from "@/lib/utils.ts";

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, isDashboardLoading, dashboardError, fetchDashboard } = useDashboardStore((state) => ({
        user: state.user,
        isDashboardLoading: state.isDashboardLoading,
        dashboardError: state.dashboardError,
        fetchDashboard: state.fetchDashboard,
    }));

    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    const pathname = location.pathname;
    const activeValue = useMemo(() => {
        if (pathname.startsWith("/dashboard/missions")) {
            return "missions";
        }
        if (pathname.startsWith("/dashboard/shop")) {
            return "shop";
        }
        if (pathname.startsWith("/dashboard/logbook")) {
            return "logbook";
        }
        if (pathname.startsWith("/dashboard/notifications")) {
            return "notifications";
        }
        return null;
    }, [pathname]);

    const navItems = useMemo(
        () => [
            {
                value: "missions",
                label: "Миссии",
                icon: "solar:running-round-outline",
                onSelect: () => navigate("/dashboard/missions"),
            },
            { value: "logbook", label: "Журнал", icon: "hugeicons:book-edit" },
            {
                value: "shop",
                label: "Магазин",
                icon: "mage:basket",
                onSelect: () => navigate("/dashboard/shop"),
            },
            { value: "notifications", label: "Уведомления", icon: "hugeicons:message-01" },
        ],
        [navigate],
    );

    if (isDashboardLoading && !user) {
        return <div className={`${styles.state} ${styles.stateLoading}`}>Загрузка профиля...</div>;
    }

    if (dashboardError) {
        return (
            <div className={`${styles.state} ${styles.stateError}`}>
                <div className={styles.stateContent}>
                    <p>{dashboardError}</p>
                    <SpaceButton onClick={() => fetchDashboard(true)} variant="outline">
                        Повторить попытку
                    </SpaceButton>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const currencyLabel = `${number_format(user.currency.amount)} ${user.currency.symbol}`;
    const experienceProgress = user.experience.max > 0 ? user.experience.current / user.experience.max : 0;

    return (
        <div className={styles.root}>
            <DashboardHeader
                user={user}
                currencyLabel={currencyLabel}
                experienceProgress={experienceProgress}
                sticky
                userAction={() => navigate('/dashboard')}
            />
            <main className={styles.main}>
                <Outlet />
            </main>
            <DashboardBottomNav activeValue={activeValue} items={navItems} />
        </div>
    );
};

export default Dashboard;
