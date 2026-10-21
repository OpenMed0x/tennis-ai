export type Stats = {
  totals: {
    reps: number; skill_minutes: number; time_min: number; money: number;
    recover: number; mindful: number; avg_rating: number | null;
  };
  reps_by_item: { item: string; count: number; minutes: number }[];
  weekly: { week: string; time_min: number; money: number; reps: number; skill_minutes: number }[];
  results: { week: string; skill?: number; mind?: number; other?: number }[];
};

export const EMPTY_STATS: Stats = {
  totals: { reps: 0, skill_minutes: 0, time_min: 0, money: 0, recover: 0, mindful: 0, avg_rating: null },
  reps_by_item: [],
  weekly: [],
  results: [],
};
