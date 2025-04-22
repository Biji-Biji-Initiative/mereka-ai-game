import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';
import { LoadingService } from '../services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class RouteGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // Show loading indicator
    this.loadingService.show();

    const userId = this.userService.getCurrentUserId();
    console.log('RouteGuard - User ID:', userId);

    // Get current route path
    const targetPath = state.url.split('?')[0];
    console.log('RouteGuard - Target path:', targetPath);

    if (!userId) {
      console.log('RouteGuard - No user ID, redirecting to welcome');
      this.router.navigate(['/welcome']);
      this.loadingService.hide();
      return false;
    }

    try {
      // Get user data from database
      const user = await this.userService.getUser(userId);
      console.log('RouteGuard - User data:', user);

      if (!user) {
        // If user not found, redirect to context page
        console.log('User not found, redirecting to context');
        this.router.navigate(['/context']);
        this.loadingService.hide();
        return false;
      }

      // If user exists but no currentRoute, set it to empty string
      if (user && user.currentRoute === undefined) {
        console.log('RouteGuard - Setting empty currentRoute');
        await this.userService.updateUserRoute(userId, '');
      }

      // Special handling for challenges page
      if (targetPath === '/challenges') {
        console.log('RouteGuard - Handling challenges page');
        // Allow access to challenges page for registered users
        this.loadingService.hide();
        return true;
      }

      // If user is on results page and trying to navigate to a non-round page
      if (user?.currentRoute === '/results' && !targetPath.includes('/round/')) {
        console.log('RouteGuard - Resetting from results page');
        // Clear the current challenge ID from localStorage
        localStorage.removeItem('currentChallengeId');
        // Update user's current route in the database
        await this.userService.updateUserRoute(userId, '');
        // Allow navigation to proceed
        this.loadingService.hide();
        return true;
      }

      // Handle parameterized routes (like /round/1)
      if (targetPath.includes('/round/')) {
        const roundNumber = parseInt(targetPath.split('/').pop() || '0');
        console.log('RouteGuard - Round number:', roundNumber);

        // If user has a current route and it's not a round route, redirect to that route
        if (user?.currentRoute && !user.currentRoute.includes('/round/')) {
          console.log('RouteGuard - Redirecting to current route:', user.currentRoute);
          this.router.navigate([user.currentRoute]);
          this.loadingService.hide();
          return false;
        }

        // If user is on a different round, redirect to their current round
        if (user?.currentRoute) {
          const currentRoundMatch = user.currentRoute.match(/\/round\/(\d+)/);
          if (currentRoundMatch) {
            const currentRound = parseInt(currentRoundMatch[1]);
            if (roundNumber !== currentRound) {
              console.log('RouteGuard - Redirecting to current round:', currentRound);
              this.router.navigate([user.currentRoute]);
              this.loadingService.hide();
              return false;
            }
          }
        }
      }

      // If user has completed initial flow (has traits and attitudes)
      if (user?.traits && user?.attitudes) {
        // If trying to access context, traits, or attitudes pages, redirect to focus
        if (['/context', '/traits', '/attitudes'].includes(targetPath)) {
          console.log('RouteGuard - Redirecting to focus page');
          this.router.navigate(['/focus']);
          this.loadingService.hide();
          return false;
        }
      }

      // If user has a current route and it's not the target route, redirect to current route
      if (user?.currentRoute && targetPath !== user.currentRoute) {
        console.log('RouteGuard - Redirecting to current route:', user.currentRoute);
        this.router.navigate([user.currentRoute]);
        this.loadingService.hide();
        return false;
      }

      // Allow navigation to proceed
      console.log('RouteGuard - Allowing navigation to:', targetPath);
      this.loadingService.hide();
      return true;
    } catch (error) {
      console.error('RouteGuard - Error:', error);
      this.router.navigate(['/welcome']);
      this.loadingService.hide();
      return false;
    }
  }

  // Helper method to determine if a route is part of the challenge flow
  private isChallengeFlowRoute(path: string): boolean {
    // Routes that are part of the challenge flow
    const challengeFlowRoutes = ['focus', 'results'];

    // Also allow round routes
    if (path.startsWith('round/')) {
      return true;
    }

    return challengeFlowRoutes.includes(path);
  }
}
