import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
    private userService: UserService,
    private loadingService: LoadingService
  ) { }

  async navigateToNextRoute(currentRoute: string, nextRoute: string): Promise<void> {
    // Show loading indicator
    this.loadingService.show();

    const userId = this.userService.getCurrentUserId();

    if (!userId) {
      // If no user ID, redirect to context page
      this.router.navigate(['/context']);
      this.loadingService.hide();
      return;
    }

    try {
      // Update the user's current route in the database
      await this.userService.updateUserRoute(userId, `/${nextRoute}`);

      // Navigate to the next route
      this.router.navigate([`/${nextRoute}`]);
    } catch (error) {
      console.error('Error navigating to next route:', error);
    } finally {
      // Hide loading indicator
      this.loadingService.hide();
    }
  }

  async navigateToPreviousRoute(currentRoute: string, previousRoute: string): Promise<void> {
    // Show loading indicator
    this.loadingService.show();

    const userId = this.userService.getCurrentUserId();

    if (!userId) {
      // If no user ID, redirect to context page
      this.router.navigate(['/context']);
      this.loadingService.hide();
      return;
    }

    try {
      // Update the user's current route in the database
      await this.userService.updateUserRoute(userId, `/${previousRoute}`);

      // Navigate to the previous route
      this.router.navigate([`/${previousRoute}`]);
    } catch (error) {
      console.error('Error navigating to previous route:', error);
    } finally {
      // Hide loading indicator
      this.loadingService.hide();
    }
  }

  async navigateToNextRound(currentRound: number): Promise<void> {
    if (currentRound < 3) {
      await this.navigateToNextRoute(`round/${currentRound}`, `round/${currentRound + 1}`);
    } else {
      await this.navigateToNextRoute(`round/${currentRound}`, 'results');
    }
  }
}
