export interface User {
    id: string;
    name: string;
    rank: string;
    avatar?: string;
    currency: {
        amount: number;
        symbol: string;
    };
    experience: {
        current: number;
        max: number;
    };
    tasks: {
        completed: number;
        total: number;
    };
    competencies: {
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
    deadline?: string;
    category: string;
    xpReward: number;
    completedDate?: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlockedDate: string;
    category: string;
    rarity: string;
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

export interface Statistics {
    overview: StatisticsOverview;
}

export interface CompetencyItem {
    id: string;
    title: string;
    description: string;
    progress: string;
}
