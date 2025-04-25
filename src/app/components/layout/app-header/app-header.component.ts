import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { AuthPopupComponent, AuthMode } from '../../auth/auth-popup/auth-popup.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthPopupComponent],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  showAuthPopup = false;
  authMode: AuthMode = 'login';
  hasStartedGame = false;
  showUserDropdown = false;
  userName = '';
  userEmail = '';
  private routerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
    // Listen for authentication state changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.loadUserInfo();
      }
    });

    // Check if user has started the game
    this.checkGameStarted();

    // Listen for navigation events to check if game has started
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkGameStarted();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  checkGameStarted() {
    const userId = this.userService.getCurrentUserId();
    this.hasStartedGame = !!userId;
  }

  async loadUserInfo() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email || '';
      this.userName = user.displayName || this.getInitialsFromEmail(this.userEmail);
    }
  }

  getInitialsFromEmail(email: string): string {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.showUserDropdown = false;
  }

  resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      // This will be connected to game service later
      console.log('Game reset requested by user');
      this.router.navigate(['/']);
    }
  }

  openAuthPopup(mode: AuthMode = 'login') {
    this.authMode = mode;
    this.showAuthPopup = true;
  }

  closeAuthPopup() {
    this.showAuthPopup = false;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  // Helper method to check if navigation links should be shown
  shouldShowNavLinks(): boolean {
    return this.hasStartedGame || this.isAuthenticated;
  }
}
