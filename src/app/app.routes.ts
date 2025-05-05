import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ContextComponent } from './pages/context/context.component';
import { TraitsComponent } from './pages/traits/traits.component';
import { AttitudesComponent } from './pages/attitudes/attitudes.component';
import { FocusComponent } from './pages/focus/focus.component';
import { DynamicRoundComponent } from './components/rounds/dynamic-round.component';
import { ResultsComponent } from './pages/results/results.component';
import { ShareComponent } from './pages/share/share.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HelpComponent } from './pages/help/help.component';
import { TournamentsComponent } from './pages/tournaments/tournaments.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { ChallengesComponent } from './pages/challenges/challenges.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'welcome', component: WelcomeComponent },
  {
    path: 'context',
    component: ContextComponent,
    data: { next: 'traits' }
  },
  {
    path: 'traits',
    component: TraitsComponent,
    data: { next: 'attitudes' }
  },
  {
    path: 'attitudes',
    component: AttitudesComponent,
    data: { next: 'focus' }
  },
  {
    path: 'focus',
    component: FocusComponent,
    data: { previous: 'attitudes', next: 'round/1' }
  },
  {
    path: 'round/:challengeId',
    component: DynamicRoundComponent,
    data: { title: 'Round' }
  },
  {
    path: 'results/:challengeId',
    component: ResultsComponent,
    data: { next: 'dashboard' }
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'share',
    component: ShareComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'tournaments',
    component: TournamentsComponent
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent
  },
  {
    path: 'challenges',
    component: ChallengesComponent
  }
];
