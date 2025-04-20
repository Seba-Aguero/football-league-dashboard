import { Component, OnInit } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { LeaderboardEntry } from '../../models/team.interface';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private leagueService: LeagueService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  async loadLeaderboard(): Promise<void> {
    try {
      this.isLoading = true;
      await this.leagueService.fetchData();
      this.leaderboard = this.leagueService.getLeaderboard();
      this.error = null;
    } catch (err) {
      this.error = 'Error loading the leaderboard';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }
}


