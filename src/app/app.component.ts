import { Component, OnInit } from '@angular/core';
import { LeagueService } from './services/league.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private leagueService: LeagueService) {}

  ngOnInit(): void {
    this.leagueService.fetchData();
  }
}
