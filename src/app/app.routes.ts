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
import { RouteGuard } from './guards/route.guard';

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
    data: { next: 'attitudes' },
    canActivate: [RouteGuard]
  },
  {
    path: 'attitudes',
    component: AttitudesComponent,
    data: { next: 'focus' },
    canActivate: [RouteGuard]
  },
  {
    path: 'focus',
    component: FocusComponent,
    data: { previous: 'attitudes', next: 'round1' },
    canActivate: [RouteGuard]
  },
  {
    path: 'round1',
    component: Round1Component,
    data: { previous: 'focus', next: 'round2' },
    canActivate: [RouteGuard]
  },
  {
    path: 'round2',
    component: Round2Component,
    data: { previous: 'round1', next: 'round3' },
    canActivate: [RouteGuard]
  },
  {
    path: 'round3',
    component: Round3Component,
    data: { previous: 'round2', next: 'results' },
    canActivate: [RouteGuard]
  },
  {
    path: 'results',
    component: ResultsComponent,
    data: { next: 'dashboard' },
    canActivate: [RouteGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'share',
    component: ShareComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'tournaments',
    component: TournamentsComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'challenges',
    component: ChallengesComponent,
    canActivate: [RouteGuard]
  }
];
