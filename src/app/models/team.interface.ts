export interface TeamStats {
  name: string;
  flag: string;
  mp: number; // matches played
  gf: number; // goals for
  ga: number; // goals against
  gd: number; // goal difference
  points: number;
  headToHead?: Record<string, HeadToHeadStats>;
}

export interface HeadToHeadStats {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

// Interface specific for leaderboard table visualization
export interface LeaderboardEntry {
  teamName: string;
  matchesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  teamFlag: string;
}

