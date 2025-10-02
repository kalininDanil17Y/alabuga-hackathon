import { ReactNode } from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CircularProgressAvatar } from "@/components/ui/custom/circular-progress-avatar";
import { SpaceButton } from "@/components/ui/custom/space-button";
import "./bottom-nav.css";
import './header.css';
import type { User } from "@/types/dashboard";

export interface DashboardHeaderProps {
    user: User;
    currencyLabel: string;
    experienceProgress: number;
    action?: ReactNode;
    sticky?: boolean;
}

export function DashboardHeader({
                                    user,
                                    currencyLabel,
                                    experienceProgress,
                                    action,
                                    sticky = false,
                                }: DashboardHeaderProps) {
    return (
        <div
            className={cn(
                "header_container relative px-4 py-4 shadow-[0_6px_16px_rgba(6,12,46,0.45)]",
                sticky && "sticky top-0 z-40 backdrop-blur-md",
            )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                        <CircularProgressAvatar
                            src={user.avatar ?? ""}
                            alt={`${user.name} avatar`}
                            progress={experienceProgress}
                            size={96}
                            className="drop-shadow-[0_0_22px_rgba(11,171,249,0.35)]"
                        />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">{user.name}</h2>
                        <p className="text-space-cyan-400 text-sm">{user.rank}</p>
                        <p className="text-white text-sm">{currencyLabel}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {action ?? (
                        <SpaceButton
                            variant="icon"
                            size="md"
                            aria-label="Открыть настройки"
                            title="Настройки"
                        >
                            <Settings className="h-5 w-5" />
                        </SpaceButton>
                    )}
                </div>
            </div>
        </div>
    );
}

export interface BottomNavItem {
    value: string;
    label: string;
    icon: string;
    onSelect?: (value: string) => void;
}

export interface DashboardBottomNavProps {
    items: BottomNavItem[];
    activeValue?: string;
    className?: string;
}

export function DashboardBottomNav({
                                       items,
                                       activeValue,
                                       className,
                                   }: DashboardBottomNavProps) {
    return (
        <nav className={cn("dashboard-bottom-nav", className)} aria-label="Основная навигация">
            <div className="dashboard-bottom-nav__shell">
                <div className="dashboard-bottom-nav__items">
                    {items.map((item) => {
                        const isActive = activeValue === item.value;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                className={cn("dashboard-bottom-nav__button", {
                                    "dashboard-bottom-nav__button--active": isActive,
                                })}
                                onClick={() => item.onSelect?.(item.value)}
                                aria-pressed={isActive}
                            >
                                <img
                                    src={item.icon}
                                    alt=""
                                    aria-hidden="true"
                                    className="dashboard-bottom-nav__icon"
                                />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
