export interface User {
    id: string;
    name: string;
    rank: string;
    avatar?: string;
    currency: {
        amount: number;
    };
    experience: {
        current: number;
        max: number;
    };
    tasks: {
        completed: number;
        total: number;
    };
    level: number;
    status: string;
    joinDate: string;
    lastActivity: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    priority: string;
    category: string;
    xpReward: number;
    completedDate?: string;
    competencyId?: string | number;
    competencyIds?: Array<string | number>;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlockedDate: string;
    category: string;
    rarity: string;
}

export interface UserActivity {
    id: string;
    title: string;
    description: string;
}

export interface ArtifactStats {
    [key: string]: number;
}

export interface Artifact {
    id: string;
    name: string;
    description: string;
    rarity: string;
    foundDate: string;
    location: string;
    image?: string;
    stats: ArtifactStats;
}

export interface StatisticsOverview {
    totalMissions: number;
    completedMissions: number;
    successRate: number;
    totalExperience: number;
    currentLevel: number;
    nextLevelXP: number;
}


export interface StatisticsWeekly {
    missionsCompleted: number;
    experienceGained: number;
    artifactsFound: number;
    achievementsUnlocked: number;
}

export interface StatisticsCategory {
    completed: number;
    total: number;
    successRate: number;
}

export interface StatisticsPerformance {
    efficiency: number;
    accuracy: number;
    teamwork: number;
    innovation: number;
}

export interface Statistics {
    overview: StatisticsOverview;
    weekly?: StatisticsWeekly;
    categories?: Record<string, StatisticsCategory>;
    performance?: StatisticsPerformance;
}

export interface CompetencyItem {
    id: number;
    title: string;
    description: string;
    value: number;
    max: number;
    level: number;
}
