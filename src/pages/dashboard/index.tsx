import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SpaceButton } from "@/components/ui/custom/space-button";
import { DashboardHeader, DashboardBottomNav } from "@/components/dashboard/layout";
import missionsIcon from "@/images/ui/bottom-nav/bottom-nav-missions.svg";
import logbookIcon from "@/images/ui/bottom-nav/bottom-nav-logbook.svg";
import shopIcon from "@/images/ui/bottom-nav/bottom-nav-shop.svg";
import notificationsIcon from "@/images/ui/bottom-nav/bottom-nav-notifications.svg";
import { useDashboardStore } from "@/store/dashboardStore";
import styles from "./Dashboard.module.css";

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

    const activeValue = location.pathname.startsWith("/dashboard/missions") ? "missions" : "logbook";

    const navItems = useMemo(
        () => [
            {
                value: "logbook",
                label: "Журнал",
                icon: logbookIcon,
                onSelect: () => navigate("/dashboard"),
            },
            {
                value: "missions",
                label: "Миссии",
                icon: missionsIcon,
                onSelect: () => navigate("/dashboard/missions"),
            },
            { value: "shop", label: "Магазин", icon: shopIcon },
            { value: "notifications", label: "Сигналы", icon: notificationsIcon },
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

    const numberFormatter = new Intl.NumberFormat("ru-RU");
    const currencyLabel = `${numberFormatter.format(user.currency.amount)} ${user.currency.symbol}`;
    const experienceProgress = user.experience.max > 0 ? user.experience.current / user.experience.max : 0;

    return (
        <div className={styles.root}>
            <DashboardHeader
                user={user}
                currencyLabel={currencyLabel}
                experienceProgress={experienceProgress}
                sticky
            />
            <main className={styles.main}>
                <Outlet />
            </main>
            <DashboardBottomNav activeValue={activeValue} items={navItems} />
        </div>
    );
};

export default Dashboard;
