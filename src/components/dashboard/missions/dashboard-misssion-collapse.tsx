import React, {useState} from "react";
import clsx from "clsx";
import styles from "./dashboard-mission-collapse.module.css";
import {Button1} from "@/components/ui/custom/button1.tsx";
import { MissionCard, MissionProps } from "@/components/dashboard/missions/dashboard-mission-card.tsx";
import Background from "@/images/ui/mission-card/collapse-bg.svg?react"

interface MissionCollapseProps extends React.HTMLAttributes<HTMLDivElement> {
    items: MissionProps[],
    title: string,
    onCollapsed?: (t: boolean) => void,
    handleDetailsClick?: (id: number) => void,
    collapsed?: boolean,
}

export function MissionCollapse ({ title, items, onCollapsed = () => {}, handleDetailsClick, collapsed = false }: MissionCollapseProps) {

    const [isExpanded, setIsExpanded] = useState(collapsed);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <div className={styles.root}>
                <Background className={styles.background}/>

                <div className={styles.content}>
                    <h3 className={styles.title}>
                        Цепочка миссий "{title}" ({items.length})
                    </h3>

                    <Button1
                        className="mb-1"
                        onClick={() => { toggleExpanded(); onCollapsed(isExpanded) }}
                        aria-label={isExpanded ? "Свернуть цепочку миссий" : "Развернуть цепочку миссий"}
                    >
                        {isExpanded ? "свернуть" : "развернуть"}
                    </Button1>
                </div>
            </div>

            <div
                className={clsx(styles.items, isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}>
                {items.map((mission, index) => (
                    <MissionCard
                        key={index}
                        {...mission}
                        onDetailsClick={handleDetailsClick}
                    />
                ))}
            </div>
        </div>
    );
}