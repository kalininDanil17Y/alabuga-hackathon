import { MouseEventHandler } from "react";
import { Home, Settings } from "lucide-react";
import clsx from "clsx";
import { CircularProgressAvatar } from "@/components/ui/custom/circular-progress-avatar";
import { SpaceButton } from "@/components/ui/custom/space-button";
import headerStyles from "./dashboard-header.module.css";
import navStyles from "./dashboard-bottom-nav.module.css";
import type { User } from "@/types/dashboard";
import { Icon } from "@iconify/react";

import BottomNavBackground from "@/images/ui/bottom-nav/dashboard-bottom-nav.svg?react"

export interface DashboardHeaderProps {
    user: User;
    currencyLabel: string;
    experienceProgress: number;
    userAction?: MouseEventHandler<HTMLDivElement>;
    settingsAction?: MouseEventHandler<HTMLButtonElement>;
    sticky?: boolean;
}

import ManaIcon from "@/images/ui/mana.svg?react";

export function DashboardHeader({ user, currencyLabel, experienceProgress, userAction, settingsAction, sticky = false }: DashboardHeaderProps) {
    return (
        <header className={clsx(headerStyles.wrapper, sticky && headerStyles.stickyHeader)}>
            <div className={headerStyles.body}>
                <div className={headerStyles.userSection}>
                    <div className={headerStyles.avatarShadow}>
                        <div className={headerStyles.avatarWrapper}>
                            <CircularProgressAvatar
                                src={user.avatar ?? ""}
                                alt={`${user.name} avatar`}
                                progress={experienceProgress}
                                level={user.level}
                                size={60}
                                onClick={userAction}
                            />
                            <span className={headerStyles.avatarHint} aria-hidden="true">
                                <Home size={14} strokeWidth={2.2} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <h2 className={headerStyles.userName}>{user.name}</h2>
                        <p className={headerStyles.userRank}>{user.rank} УР.{user.level}</p>
                        <p className={clsx(headerStyles.userCurrency, "flex flex-row gap-1 items-center")}>{currencyLabel} <ManaIcon width="16px" height="16px"/></p>
                    </div>
                </div>
                <div className={headerStyles.actionArea}>
                    <SpaceButton variant="icon" size="md" aria-label="Настройки" title="Настройки" onClick={settingsAction}>
                        <Settings size={20} />
                    </SpaceButton>
                </div>
            </div>
        </header>
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

export function DashboardBottomNav({ items, activeValue, className }: DashboardBottomNavProps) {
    return (
        <nav className={clsx(navStyles.root, className)} aria-label="Основная навигация">
            <BottomNavBackground className={navStyles.background}/>
            <div className={navStyles.shell}>
                <div className={navStyles.items}>
                    {items.map((item) => {
                        const isActive = activeValue === item.value;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                className={clsx(navStyles.button, isActive && navStyles.active)}
                                onClick={() => item.onSelect?.(item.value)}
                                aria-pressed={isActive}
                            >
                                <Icon className={clsx(navStyles.icon, isActive && navStyles.activeIcon)} icon={item.icon} color="#6ACFF6" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

