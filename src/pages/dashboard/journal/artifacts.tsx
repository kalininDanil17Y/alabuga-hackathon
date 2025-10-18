import { useMemo } from "react";
import clsx from "clsx";
import { HorizontalRule } from "@/components/ui/custom/horizontal-rule.tsx";
import { useDashboardStore } from "@/store/dashboardStore";
import { SpaceCard } from "@/components/ui/custom/space-card";
import styles from "./Artifacts.module.css";

const rarityClassMap: Record<string, string> = {
    legendary: styles.rarityLegendary,
    epic: styles.rarityEpic,
    rare: styles.rarityRare,
    uncommon: styles.rarityUncommon,
    common: styles.rarityCommon,
};

const formatDateParts = (value?: string | null): { primary: string; secondary: string } => {
    if (!value) {
        return { primary: "--", secondary: "--" };
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return { primary: "--", secondary: "--" };
    }

    const primary = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const secondary = date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

    return { primary, secondary };
};

const DashboardJournalArtifacts = () => {
    const { artifacts, isDashboardLoading } = useDashboardStore((state) => ({
        artifacts: state.artifacts,
        isDashboardLoading: state.isDashboardLoading,
    }));

    const normalizedArtifacts = useMemo(
        () =>
            artifacts.map((artifact) => ({
                ...artifact,
                description:
                    artifact.description && artifact.description.trim().length > 0
                        ? artifact.description.trim()
                        : "Описание появится позже.",
            })),
        [artifacts],
    );

    if (isDashboardLoading && normalizedArtifacts.length === 0) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <p className={styles.stateMessage}>Загружаем учёт артефактов...</p>
            </SpaceCard>
        );
    }

    if (normalizedArtifacts.length === 0) {
        return (
            <SpaceCard variant="glass" className={styles.stateCard}>
                <p className={styles.stateMessage}>Артефакты ещё не обнаружены.</p>
            </SpaceCard>
        );
    }

    return (
        <div className={styles.root}>
            <HorizontalRule paddingX="12px" variant="default" className={styles.rule} />
            <div className={styles.grid}>
                {normalizedArtifacts.map((artifact) => {
                    const rarityClass = rarityClassMap[artifact.rarity] ?? styles.rarityCommon;
                    const { primary, secondary } = formatDateParts(artifact.foundDate);

                    return (
                        <article key={artifact.id} className={clsx(styles.card, rarityClass)}>
                            <div className={styles.meta}>
                                <span>{primary}</span>
                                <span>{secondary}</span>
                            </div>
                            <div className={styles.image}>
                                {artifact.image ? (
                                    <img src={artifact.image} alt={artifact.name} loading="lazy" />
                                ) : (
                                    <div className={styles.placeholderIcon} aria-hidden="true">
                                        ?
                                    </div>
                                )}
                            </div>
                            <h3 className={styles.title}>{artifact.name}</h3>
                            <p className={styles.description}>{artifact.description}</p>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardJournalArtifacts;
