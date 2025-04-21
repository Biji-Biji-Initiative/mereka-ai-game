import { Routes } from '@angular/router';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ContextComponent } from './pages/context/context.component';
import { TraitsComponent } from './pages/traits/traits.component';
import { AttitudesComponent } from './pages/attitudes/attitudes.component';
import { FocusComponent } from './pages/focus/focus.component';

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
  }
];
