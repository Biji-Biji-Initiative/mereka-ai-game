import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

export type AuthMode = 'login' | 'register' | 'reset-password';

@Component({
  selector: 'app-auth-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-popup.component.html',
  styleUrl: './auth-popup.component.scss'
})
export class AuthPopupComponent {
  @Input() mode: AuthMode = 'login';
  @Output() close = new EventEmitter<void>();

  email = '';
  password = '';
  confirmPassword = '';
  isProcessing = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  async onSubmit() {
    this.error = '';
    this.isProcessing = true;

    try {
      switch (this.mode) {
        case 'login':
          await this.login();
          break;
        case 'register':
          await this.register();
          break;
        case 'reset-password':
          await this.resetPassword();
          break;
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred. Please try again.';
    } finally {
      this.isProcessing = false;
    }
  }

  private async login() {
    if (!this.email || !this.password) {
      throw new Error('Please enter both email and password');
    }
    await this.authService.signInWithEmail(this.email, this.password);
    this.close.emit();
    this.router.navigate(['/dashboard']);
  }

  private async register() {
    if (!this.email || !this.password || !this.confirmPassword) {
      throw new Error('Please fill in all fields');
    }
    if (this.password !== this.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    await this.authService.createAccountWithEmail(this.email, this.password);
    this.close.emit();
    this.router.navigate(['/dashboard']);
  }

  private async resetPassword() {
    if (!this.email) {
      throw new Error('Please enter your email');
    }
    await this.authService.resetPassword(this.email);
    this.close.emit();
  }

  async loginWithGoogle() {
    try {
      await this.authService.signInWithGoogle();
      this.close.emit();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.error = error.message || 'Failed to sign in with Google';
    }
  }

  setMode(mode: AuthMode) {
    this.mode = mode;
    this.error = '';
  }
}
