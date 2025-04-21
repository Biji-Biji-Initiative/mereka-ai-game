import { Routes } from '@angular/router';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ContextComponent } from './pages/context/context.component';
import { TraitsComponent } from './pages/traits/traits.component';
import { AttitudesComponent } from './pages/attitudes/attitudes.component';
import { FocusComponent } from './pages/focus/focus.component';
import { Round1Component } from './components/rounds/round1.component';
import { Round2Component } from './components/rounds/round2.component';
import { Round3Component } from './components/rounds/round3.component';
import { ResultsComponent } from './pages/results/results.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
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
    component: ResultsComponent
  }
];
