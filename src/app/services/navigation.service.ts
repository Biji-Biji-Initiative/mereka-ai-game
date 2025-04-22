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
    console.log(`Navigating from ${currentRoute} to ${nextRoute}`);

    const userId = this.userService.getCurrentUserId();

    if (!userId) {
      // If no user ID, redirect to context page
      console.error('No user ID found, redirecting to context');
      this.router.navigate(['/context']);
      this.loadingService.hide();
      return;
    }

    try {
      // Update the user's current route in the database
      const routeWithSlash = nextRoute.startsWith('/') ? nextRoute : `/${nextRoute}`;
      console.log(`Updating user route to: ${routeWithSlash}`);
      await this.userService.updateUserRoute(userId, routeWithSlash);

      // Navigate to the next route
      console.log(`Navigating to: ${routeWithSlash}`);
      this.router.navigate([routeWithSlash]);
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

  async navigateToNextRound(currentRound: number, maxRounds: number): Promise<void> {
    console.log(`Navigating to next round: current=${currentRound}, max=${maxRounds}`);
    if (currentRound < maxRounds) {
      const nextRoute = `round/${currentRound + 1}`;
      console.log(`Next route: ${nextRoute}`);
      await this.navigateToNextRoute(`round/${currentRound}`, nextRoute);
    } else {
      console.log('Navigating to results');
      await this.navigateToNextRoute(`round/${currentRound}`, 'results');
    }
  }
}
