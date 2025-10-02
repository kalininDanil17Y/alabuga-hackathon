import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    DashboardHeader,
    DashboardBottomNav,
} from "@/components/dashboard/layout.tsx";
import missionsIcon from "@/images/ui/bottom-nav/bottom-nav-missions.svg";
import logbookIcon from "@/images/ui/bottom-nav/bottom-nav-logbook.svg";
import shopIcon from "@/images/ui/bottom-nav/bottom-nav-shop.svg";
import notificationsIcon from "@/images/ui/bottom-nav/bottom-nav-notifications.svg";
import type { User } from "@/types/dashboard";

const Index = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadUser = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch("/data/user.json", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Не удалось загрузить профиль пользователя");
                }

                const payload = (await response.json()) as User;

                if (!controller.signal.aborted) {
                    setUser(payload);
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Не удалось загрузить профиль пользователя",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadUser();

        return () => controller.abort();
    }, []);

    const location = useLocation();
    const navigate = useNavigate();

    const activeValue = location.pathname.startsWith("/dashboard/missions")
        ? "missions"
        : "logbook";

    const handleNavSelect = useCallback(
        (value: string) => {
            if (value === "missions") {
                navigate("/dashboard/missions");
                return;
            }

            if (value === "logbook") {
                navigate("/dashboard");
                return;
            }
        },
        [navigate],
    );

    const navItems = useMemo(
        () => [
            {
                value: "logbook",
                label: "Летная книга",
                icon: logbookIcon,
                onSelect: () => handleNavSelect("logbook"),
            },
            {
                value: "missions",
                label: "Миссии",
                icon: missionsIcon,
                onSelect: () => handleNavSelect("missions"),
            },
            { value: "shop", label: "Магазин", icon: shopIcon },
            { value: "notifications", label: "Уведомления", icon: notificationsIcon },
        ],
        [handleNavSelect],
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-space-blue-900 text-white/70 flex items-center justify-center">
                Загружаем профиль...
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-space-blue-900 text-red-300 flex items-center justify-center px-4 text-center">
                {error ?? "Профиль пользователя недоступен"}
            </div>
        );
    }

    const numberFormatter = new Intl.NumberFormat("ru-RU");
    const currencyLabel = `${numberFormatter.format(user.currency.amount)} ${user.currency.symbol}`;
    const experienceProgress =
        user.experience.max > 0 ? user.experience.current / user.experience.max : 0;

    return (
        <div className="min-h-screen bg-space-blue-900">
            <DashboardHeader
                user={user}
                currencyLabel={currencyLabel}
                experienceProgress={experienceProgress}
                sticky
            />
            <main className="px-4 py-4 pb-32">
                <Outlet />
            </main>
            <DashboardBottomNav activeValue={activeValue} items={navItems} />
        </div>
    );
};

export default Index;
