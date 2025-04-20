import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CustomDatePipe } from './pipes/custom-date.pipe';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    ScheduleComponent,
    LeaderboardComponent,
    NotFoundComponent,
    CustomDatePipe,
    HeaderComponent,
    FooterComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, RouterModule, HttpClientModule],
  exports: [],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
