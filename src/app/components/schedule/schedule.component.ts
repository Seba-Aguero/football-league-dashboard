import { Component, OnInit } from '@angular/core';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  matches: any[] = [];
  loading: boolean = true;

  constructor(private leagueService: LeagueService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.leagueService.fetchData();
      this.matches = this.leagueService.getMatches();
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      this.loading = false;
    }
  }
}
