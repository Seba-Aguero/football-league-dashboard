import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LeagueService } from '../src/app/services/league.service';

describe('LeagueService', () => {
  let leagueService: LeagueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [LeagueService],
    });
    leagueService = TestBed.get(LeagueService);
  });

  describe('Basic functionality', () => {
    test('should set and get matches correctly', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Maracanã',
          homeTeam: 'Brazil',
          awayTeam: 'France',
          matchPlayed: true,
          homeTeamScore: 2,
          awayTeamScore: 1,
        },
      ];

      leagueService.setMatches(matches);
      const retrievedMatches = leagueService.getMatches();

      expect(retrievedMatches).toHaveLength(1);
      expect(retrievedMatches[0].homeTeam).toBe('Brazil');
      expect(retrievedMatches[0].awayTeam).toBe('France');
    });

    test('should calculate basic stats correctly', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Maracanã',
          homeTeam: 'Brazil',
          awayTeam: 'France',
          matchPlayed: true,
          homeTeamScore: 2,
          awayTeamScore: 1,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      expect(leaderboard[0].name).toBe('Brazil');
      expect(leaderboard[0].mp).toBe(1);
      expect(leaderboard[0].gf).toBe(2);
      expect(leaderboard[0].ga).toBe(1);
      expect(leaderboard[0].points).toBe(3);
      expect(leaderboard[0].gd).toBe(1);
      expect(leaderboard[1].name).toBe('France');
    });
  });

  describe('Points calculation', () => {
    test('should award 3 points for a win', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium',
          homeTeam: 'TeamA',
          awayTeam: 'TeamB',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 0,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      expect(leaderboard[0].points).toBe(3);
      expect(leaderboard[1].points).toBe(0);
    });

    test('should award 1 point for a draw', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium',
          homeTeam: 'TeamA',
          awayTeam: 'TeamB',
          matchPlayed: true,
          homeTeamScore: 1,
          awayTeamScore: 1,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      expect(leaderboard[0].points).toBe(1);
      expect(leaderboard[1].points).toBe(1);
    });
  });

  describe('Tiebreakers', () => {
    test('should break tie using head-to-head points (2 teams)', () => {
      const matches = [
        // Head-to-head between TeamA and TeamB
        {
          matchDate: Date.now(),
          stadium: 'Stadium2',
          homeTeam: 'TeamA',
          awayTeam: 'TeamB',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 0,
        },
        // Rest of matches
        {
          matchDate: Date.now(),
          stadium: 'Stadium1',
          homeTeam: 'TeamB',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 2,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium3',
          homeTeam: 'TeamA',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium4',
          homeTeam: 'TeamB',
          awayTeam: 'TeamD',
          matchPlayed: true,
          homeTeamScore: 1,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium5',
          homeTeam: 'TeamC',
          awayTeam: 'TeamD',
          matchPlayed: true,
          homeTeamScore: 1,
          awayTeamScore: 0,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      // TeamA y TeamB both haven 6 points.
      // TeamA has 3 points in head-to-head for winning against TeamB
      expect(leaderboard[0].name).toBe('TeamA');
      expect(leaderboard[1].name).toBe('TeamB');
      expect(leaderboard[0].points).toBe(6);
      expect(leaderboard[1].points).toBe(6);

      // Head-to-head specific checks
      const teamA = leaderboard[0];
      const teamB = leaderboard[1];

      expect(teamA.headToHead['TeamB'].points).toBe(3);
      expect(teamA.headToHead['TeamB'].gf).toBe(3);
      expect(teamA.headToHead['TeamB'].ga).toBe(0);

      expect(teamB.headToHead['TeamA'].points).toBe(0);
      expect(teamB.headToHead['TeamA'].gf).toBe(0);
      expect(teamB.headToHead['TeamA'].ga).toBe(3);
    });

    test('should break tie using head-to-head points (3 teams)', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium1',
          homeTeam: 'TeamA',
          awayTeam: 'TeamB',
          matchPlayed: true,
          homeTeamScore: 1,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium2',
          homeTeam: 'TeamA',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium3',
          homeTeam: 'TeamB',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 2,
          awayTeamScore: 1,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium4',
          homeTeam: 'TeamB',
          awayTeam: 'TeamD',
          matchPlayed: true,
          homeTeamScore: 4,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium5',
          homeTeam: 'TeamC',
          awayTeam: 'TeamD',
          matchPlayed: true,
          homeTeamScore: 2,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium6',
          homeTeam: 'TeamC',
          awayTeam: 'TeamE',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 1,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium7',
          homeTeam: 'TeamD',
          awayTeam: 'TeamE',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 2,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      // All three teams (A, B, C) have 6 points total, but different head-to-head records
      // A wins against B and C, B wins against C, C loses to both A and B
      expect(leaderboard[0].name).toBe('TeamA');
      expect(leaderboard[0].points).toBe(6);

      expect(leaderboard[1].name).toBe('TeamB');
      expect(leaderboard[1].points).toBe(6);

      expect(leaderboard[2].name).toBe('TeamC');
      expect(leaderboard[2].points).toBe(6);

      expect(leaderboard[3].name).toBe('TeamD');
      expect(leaderboard[3].points).toBe(3);

      expect(leaderboard[4].name).toBe('TeamE');
      expect(leaderboard[4].points).toBe(0);

      // Verify head-to-head records for tied teams
      const teamA = leaderboard[0];
      const teamB = leaderboard[1];
      const teamC = leaderboard[2];

      expect(teamA.headToHead['TeamB'].points).toBe(3);
      expect(teamA.headToHead['TeamC'].points).toBe(3);
      expect(teamB.headToHead['TeamA'].points).toBe(0);
      expect(teamB.headToHead['TeamC'].points).toBe(3);
      expect(teamC.headToHead['TeamA'].points).toBe(0);
      expect(teamC.headToHead['TeamB'].points).toBe(0);
    });

    test('should break tie using goal difference when head-to-head is equal', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium1',
          homeTeam: 'TeamA',
          awayTeam: 'TeamB',
          matchPlayed: true,
          homeTeamScore: 2,
          awayTeamScore: 2,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium2',
          homeTeam: 'TeamA',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 0,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium3',
          homeTeam: 'TeamB',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 1,
          awayTeamScore: 0,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      // TeamA and TeamB have same points and head-to-head, but TeamA has better GD
      expect(leaderboard[0].name).toBe('TeamA');
      expect(leaderboard[1].name).toBe('TeamB');
    });

    test('should break tie using goals scored when points, head-to-head and GD are equal', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium1',
          homeTeam: 'TeamA',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 3,
          awayTeamScore: 1,
        },
        {
          matchDate: Date.now(),
          stadium: 'Stadium2',
          homeTeam: 'TeamB',
          awayTeam: 'TeamC',
          matchPlayed: true,
          homeTeamScore: 2,
          awayTeamScore: 0,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      // TeamA and TeamB have same points and GD, but TeamA scored more goals
      expect(leaderboard[0].name).toBe('TeamA');
      expect(leaderboard[1].name).toBe('TeamB');
    });

    test('should break tie using alphabetical order as last resort', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium1',
          homeTeam: 'Brazil',
          awayTeam: 'Argentina',
          matchPlayed: true,
          homeTeamScore: 1,
          awayTeamScore: 1,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      // Both teams have same points, GD, and goals scored
      expect(leaderboard[0].name).toBe('Argentina');
      expect(leaderboard[1].name).toBe('Brazil');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty matches array', () => {
      leagueService.setMatches([]);
      const leaderboard = leagueService.getLeaderboard();
      expect(leaderboard).toHaveLength(0);
    });

    test('should handle unplayed matches', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium',
          homeTeam: 'TeamA',
          awayTeam: 'TeamB',
          matchPlayed: false, // This game hasn't been played
          homeTeamScore: null,
          awayTeamScore: null,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      // Verufy that both teams are present
      expect(leaderboard).toHaveLength(2);

      // Verufy TeamA
      expect(leaderboard[0].name).toBe('TeamA');
      expect(leaderboard[0].mp).toBe(0);
      expect(leaderboard[0].points).toBe(0);
      expect(leaderboard[0].gf).toBe(0);
      expect(leaderboard[0].ga).toBe(0);

      // Verufy TeamB
      expect(leaderboard[1].name).toBe('TeamB');
      expect(leaderboard[1].mp).toBe(0);
      expect(leaderboard[1].points).toBe(0);
      expect(leaderboard[1].gf).toBe(0);
      expect(leaderboard[1].ga).toBe(0);
    });

    test('should handle high scoring matches', () => {
      const matches = [
        {
          matchDate: Date.now(),
          stadium: 'Stadium',
          homeTeam: 'TeamA',
          awayTeam: 'TeamB',
          matchPlayed: true,
          homeTeamScore: 10,
          awayTeamScore: 9,
        },
      ];

      leagueService.setMatches(matches);
      const leaderboard = leagueService.getLeaderboard();

      expect(leaderboard[0].gf).toBe(10);
      expect(leaderboard[0].ga).toBe(9);
      expect(leaderboard[0].gd).toBe(1);
    });
  });
});
