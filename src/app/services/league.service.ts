import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LeagueService {
  private matches: any[] = [];
  private apiUrl = 'http://localhost:3001/api/v1';

  // Mapping of team names to country codes
  private countryCodes: { [key: string]: string } = {
    Brazil: 'BR',
    Cameroon: 'CM',
    Switzerland: 'CH',
    Serbia: 'RS',
  };

  constructor(private http: HttpClient) {}

  /**
   * Sets the match schedule.
   * Match schedule will be given in the following form:
   * [
   *      {
   *          matchDate: [TIMESTAMP],
   *          stadium: [STRING],
   *          homeTeam: [STRING],
   *          awayTeam: [STRING],
   *          matchPlayed: [BOOLEAN],
   *          homeTeamScore: [INTEGER],
   *          awayTeamScore: [INTEGER]
   *      },
   *      {
   *          matchDate: [TIMESTAMP],
   *          stadium: [STRING],
   *          homeTeam: [STRING],
   *          awayTeam: [STRING],
   *          matchPlayed: [BOOLEAN],
   *          homeTeamScore: [INTEGER],
   *          awayTeamScore: [INTEGER]
   *      }
   * ]
   *
   * @param {Array} matches List of matches.
   */

  setMatches(matches: any[]): void {
    this.matches = matches;
  }

  /**
   * Returns the full list of matches.
   *
   * @returns {Array} List of matches.
   */
  getMatches(): any[] {
    return this.matches.map((match) => ({
      ...match,
      homeTeamFlag: this.getFlagUrl(match.homeTeam),
      awayTeamFlag: this.getFlagUrl(match.awayTeam),
    }));
  }

  /**
   * Returns the leaderBoard in a form of a list of JSON objecs.
   *
   * [
   *      {
   *          teamName: [STRING]',
   *          matchesPlayed: [INTEGER],
   *          goalsFor: [INTEGER],
   *          goalsAgainst: [INTEGER],
   *          points: [INTEGER]
   *      },
   * ]
   *
   * @returns {Array} List of teams representing the leaderBoard.
   */
  getLeaderboard(): any[] {
    const teams: any = {};

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

    // Convert the teams object into an array with flag URL and goal difference
    const leaderboard = Object.keys(teams).map((team) => ({
      name: team,
      flag: this.getFlagUrl(team),
      ...teams[team],
      gd: teams[team].gf - teams[team].ga,
    }));

    // Sort by points, head-to-head, goal difference, goals for, and team name
    return this.sortLeaderboard(leaderboard, teams);
  }

  /**
   * Asynchronic function to fetch the data from the server and set the matches.
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
    team: any,
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
    team: any,
    opponent: string,
    goalsFor: number,
    goalsAgainst: number,
    points: number
  ): void {
    if (!team.headToHead[opponent]) {
      team.headToHead[opponent] = { gf: 0, ga: 0, points: 0 };
    }

    team.headToHead[opponent].gf += goalsFor;
    team.headToHead[opponent].ga += goalsAgainst;
    team.headToHead[opponent].points += points;
  }

  private sortLeaderboard(leaderboard: any[], teams: any): any[] {
    return leaderboard.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;

      const headToHeadPointsA = teams[a.name].headToHead[b.name]?.points || 0;
      const headToHeadPointsB = teams[b.name].headToHead[a.name]?.points || 0;

      if (headToHeadPointsA !== headToHeadPointsB) {
        return headToHeadPointsB - headToHeadPointsA;
      }

      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;

      return a.name.localeCompare(b.name);
    });
  }

  private getFlagUrl(teamName: string): string {
    const countryCode = this.countryCodes[teamName];
    return `https://flagsapi.com/${countryCode}/flat/64.png`;
  }
}
