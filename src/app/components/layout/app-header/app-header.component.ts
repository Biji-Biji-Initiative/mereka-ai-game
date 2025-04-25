import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent implements OnInit {
  isAuthenticated = false;
  showSaveModal = false;
  showLoginModal = false;
  saveEmail = '';
  savePassword = '';
  loginEmail = '';
  loginPassword = '';
  isSaving = false;
  isLoggingIn = false;
  saveError = '';
  loginError = '';
  hasStartedGame = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // Check if user has started the game
    const userId = this.userService.getCurrentUserId();
    this.hasStartedGame = !!userId;
  }

  logout() {
    this.authService.logout();
  }

  resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      // This will be connected to game service later
      console.log('Game reset requested by user');
      this.router.navigate(['/']);
    }
  }

  openLoginModal() {
    this.showLoginModal = true;
    this.loginError = '';
  }

  closeLoginModal() {
    this.showLoginModal = false;
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginError = '';
  }

  async login() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Please enter both email and password';
      return;
    }

    this.isLoggingIn = true;
    this.loginError = '';

    try {
      await this.authService.signInWithEmail(this.loginEmail, this.loginPassword);
      this.closeLoginModal();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Error signing in:', error);
      this.loginError = error.message || 'Failed to sign in. Please try again.';
    } finally {
      this.isLoggingIn = false;
    }
  }

  openSaveModal() {
    this.showSaveModal = true;
    this.saveError = '';
  }

  closeSaveModal() {
    this.showSaveModal = false;
    this.saveEmail = '';
    this.savePassword = '';
    this.saveError = '';
  }

  async saveProgress() {
    if (!this.saveEmail || !this.savePassword) {
      this.saveError = 'Please enter both email and password';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    try {
      // Create account with email and password
      await this.authService.createAccountWithEmail(this.saveEmail, this.savePassword);

      // Close the modal and navigate to dashboard
      this.closeSaveModal();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error saving progress:', error);
      this.saveError = 'Failed to save progress. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }
}
