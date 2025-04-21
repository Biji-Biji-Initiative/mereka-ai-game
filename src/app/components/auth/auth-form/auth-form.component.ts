import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent
} from '../../ui/card/card.component';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent
  ],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  @Input() mode: 'signin' | 'signup' = 'signin';

  email: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) { }

  async handleEmailSignIn(event: Event) {
    event.preventDefault();

    if (!this.email || !this.email.includes('@')) {
      // TODO: Add toast notification
      return;
    }

    this.isLoading = true;

    try {
      // TODO: Implement authentication logic
      console.log('Signing in with email:', this.email);
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async handleGoogleSignIn() {
    this.isLoading = true;

    try {
      // TODO: Implement Google authentication
      console.log('Signing in with Google');
    } catch (error) {
      console.error('Google authentication error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToAuth(mode: 'signin' | 'signup') {
    this.router.navigate([mode === 'signin' ? '/signup' : '/signin']);
  }
}
