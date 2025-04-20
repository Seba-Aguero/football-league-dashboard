import { Component, OnInit } from '@angular/core';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  leaderboard: any[] = [];
  loading: boolean = true;

  constructor(private leagueService: LeagueService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.leagueService.fetchData();
      this.leaderboard = this.leagueService.getLeaderboard();
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.loading = false;
    }
  }
}
