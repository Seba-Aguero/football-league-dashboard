export interface Match {
  id: number;
  matchDate: string | Date;
  stadium: string;
  homeTeam: string;
  awayTeam: string;
  matchPlayed: boolean;
  homeTeamScore?: number;
  awayTeamScore?: number;
}

export interface MatchWithFlags extends Match {
  homeTeamFlag: string;
  awayTeamFlag: string;
}

