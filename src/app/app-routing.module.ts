import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/schedule', pathMatch: 'full' },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', component: NotFoundComponent }, // Wildcard route for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
