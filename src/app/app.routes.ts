import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ContextComponent } from './pages/context/context.component';
import { TraitsComponent } from './pages/traits/traits.component';
import { AttitudesComponent } from './pages/attitudes/attitudes.component';
import { FocusComponent } from './pages/focus/focus.component';
import { Round1Component } from './components/rounds/round1.component';
import { Round2Component } from './components/rounds/round2.component';
import { Round3Component } from './components/rounds/round3.component';
import { ResultsComponent } from './pages/results/results.component';
import { ShareComponent } from './pages/share/share.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HelpComponent } from './pages/help/help.component';
import { TournamentsComponent } from './pages/tournaments/tournaments.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { ChallengesComponent } from './pages/challenges/challenges.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent }
    ]
  },
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
    data: { previous: 'attitudes', next: 'round1' }
  },
  {
    path: 'round1',
    component: Round1Component,
    data: { previous: 'focus', next: 'round2' }
  },
  {
    path: 'round2',
    component: Round2Component,
    data: { previous: 'round1', next: 'round3' }
  },
  {
    path: 'round3',
    component: Round3Component,
    data: { previous: 'round2', next: 'results' }
  },
  {
    path: 'results',
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
