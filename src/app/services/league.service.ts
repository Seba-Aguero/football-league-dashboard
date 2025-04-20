import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Match, MatchWithFlags } from '../models/match.interface';
import { TeamStats, HeadToHeadStats, LeaderboardEntry } from '../models/team.interface';
import { API_CONFIG, COUNTRY_CODES, FLAGS_API } from '../config/app.config';

@Injectable({
  providedIn: 'root',
})
export class LeagueService {
  private matches: Match[] = [];
  private apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_V1}`;

  constructor(private http: HttpClient) {}

  /**
   * Sets the list of matches.
   */
  setMatches(matches: Match[]): void {
    this.matches = matches;
  }

  /**
   * Returns the full list of matches.
   */
  getMatches(): MatchWithFlags[] {
    return this.matches.map((match) => ({
      ...match,
      homeTeamFlag: this.getFlagUrl(match.homeTeam),
      awayTeamFlag: this.getFlagUrl(match.awayTeam),
    }));
  }

  /**
   * Returns the leaderboard table.
   */
  getLeaderboard(): LeaderboardEntry[] {
    const teams: Record<string, TeamStats & { headToHead: Record<string, HeadToHeadStats> }> = {};

    // Iterate through the matches and calculate the statistics for each team
    this.matches.forEach((match) => {
      this.initializeTeam(teams, match.homeTeam);
      this.initializeTeam(teams, match.awayTeam);

      if (match.matchPlayed) {
        const { homePoints, awayPoints } = this.calculateMatchPoints(
          match.homeTeamScore,
          match.awayTeamScore
        );

        this.updateTeamStats(
          teams[match.homeTeam],
          match.homeTeamScore,
          match.awayTeamScore,
          homePoints
        );
        this.updateTeamStats(
          teams[match.awayTeam],
          match.awayTeamScore,
          match.homeTeamScore,
          awayPoints
        );

        // Head-to-head statistics for tiebreak
        this.updateHeadToHeadStats(
          teams[match.homeTeam],
          match.awayTeam,
          match.homeTeamScore,
          match.awayTeamScore,
          homePoints
        );
        this.updateHeadToHeadStats(
          teams[match.awayTeam],
          match.homeTeam,
          match.awayTeamScore,
          match.homeTeamScore,
          awayPoints
        );
      }
    });

    // Convert to LeaderboardEntry
    const leaderboard = Object.keys(teams).map((team) => ({
      teamName: team,
      teamFlag: this.getFlagUrl(team),
      matchesPlayed: teams[team].mp,
      goalsFor: teams[team].gf,
      goalsAgainst: teams[team].ga,
      goalDifference: teams[team].gf - teams[team].ga,
      points: teams[team].points
    }));

    // Sort the leaderboard
    return this.sortLeaderboard(leaderboard, teams);
  }

  /**
   * Asynchronous function to fetch the data from the server and set the matches.
   */
  async fetchData(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return new Promise((resolve, reject) => {
        this.http.get(`${this.apiUrl}/getAllMatches`, { headers }).subscribe({
          next: (data: any) => {
            this.setMatches(data.matches);
            resolve();
          },
          error: (error) => {
            console.error('Error fetching data:', error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  private getAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/getAccessToken`).subscribe({
        next: (response: any) => {
          resolve(response.access_token);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  private initializeTeam(teams: any, teamName: string): void {
    if (!teams[teamName]) {
      teams[teamName] = {
        mp: 0,
        gf: 0,
        ga: 0,
        points: 0,
        headToHead: {},
      };
    }
  }

  private calculateMatchPoints(
    homeTeamScore: number,
    awayTeamScore: number
  ): { homePoints: number; awayPoints: number } {
    if (homeTeamScore > awayTeamScore) {
      return { homePoints: 3, awayPoints: 0 };
    } else if (homeTeamScore < awayTeamScore) {
      return { homePoints: 0, awayPoints: 3 };
    } else {
      return { homePoints: 1, awayPoints: 1 };
    }
  }

  private updateTeamStats(
    team: TeamStats & { headToHead: Record<string, HeadToHeadStats> },
    goalsFor: number,
    goalsAgainst: number,
    points: number
  ): void {
    team.mp += 1;
    team.gf += goalsFor;
    team.ga += goalsAgainst;
    team.points += points;
  }

  private updateHeadToHeadStats(
    team: TeamStats & { headToHead: Record<string, HeadToHeadStats> },
    opponent: string,
    goalsFor: number,
    goalsAgainst: number,
    points: number
  ): void {
    if (!team.headToHead[opponent]) {
      team.headToHead[opponent] = {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0
      };
    }
    
    team.headToHead[opponent].points += points;
    team.headToHead[opponent].goalsFor += goalsFor;
    team.headToHead[opponent].goalsAgainst += goalsAgainst;
  }

  private sortLeaderboard(leaderboard: LeaderboardEntry[], teams: any): LeaderboardEntry[] {
    return leaderboard.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;

      const headToHeadPointsA = teams[a.teamName].headToHead[b.teamName]?.points || 0;
      const headToHeadPointsB = teams[b.teamName].headToHead[a.teamName]?.points || 0;

      if (headToHeadPointsA !== headToHeadPointsB) {
        return headToHeadPointsB - headToHeadPointsA;
      }

      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

      return a.teamName.localeCompare(b.teamName);
    });
  }

  private getFlagUrl(teamName: string): string {
    const countryCode = COUNTRY_CODES[teamName];
    return `${FLAGS_API.BASE_URL}/${countryCode}/${FLAGS_API.STYLE}/${FLAGS_API.SIZE}.png`;
  }
}
