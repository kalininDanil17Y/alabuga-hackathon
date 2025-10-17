export type MissionStatus =
  | "available"
  | "in_progress"
  | "moderation"
  | "completed"
  | "locked";

export interface MissionTask {
  id: string;
  title: string;
  status: MissionStatus;
  progress: number;
  competencyId?: string;
  reward?: {
    xp?: number;
    currency?: number;
  };
}

export interface MissionEntry {
  id: string;
  title: string;
  description?: string;
  status: MissionStatus;
  type: "chain" | "single";
  competencyId?: number;
  difficulty?: "low" | "medium" | "high";
  tasks: MissionTask[];
  rewards?: {
    xp?: number;
    items?: string[];
  };
}

export interface MissionFilters {
  status?: MissionStatus | "all";
  competencyId?: string | "all";
}
