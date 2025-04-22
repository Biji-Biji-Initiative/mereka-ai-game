import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
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

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    // Show loading indicator
    this.loadingService.show();

    const userId = this.userService.getCurrentUserId();

    if (!userId) {
      // If no user ID, redirect to context page
      this.router.navigate(['/context']);
      this.loadingService.hide();
      return false;
    }

    try {
      // Get user data from database
      const user = await this.userService.getUser(userId);

      if (!user) {
        // If user not found, redirect to context page
        this.router.navigate(['/context']);
        this.loadingService.hide();
        return false;
      }

      // Get the current route from the database
      const currentRoute = user.currentRoute || '/context';
      console.log('Current route from DB:', currentRoute);
      console.log('Route path:', route.routeConfig?.path);

      // If coming from results page and navigating to a non-round page, reset challenge
      if (currentRoute === '/results' &&
        route.routeConfig?.path &&
        !route.routeConfig.path.startsWith('round/') &&
        route.routeConfig.path !== 'results') {
        console.log('Resetting challenge after results');
        // Clear current challenge ID
        localStorage.removeItem('currentChallengeId');
        // Update user's current route to the new route
        await this.userService.updateUserRoute(userId, `/${route.routeConfig.path}`);
        this.loadingService.hide();
        return true;
      }

      // Special handling for parameterized routes like 'round/:round'
      if (route.routeConfig?.path === 'round/:round' && currentRoute.startsWith('/round/')) {
        // Allow access to any round if the current route is a round route
        this.loadingService.hide();
        return true;
      }

      // Special handling for results page
      if (route.routeConfig?.path === 'results' && currentRoute.startsWith('/round/')) {
        // Allow access to results page if the current route is a round route
        this.loadingService.hide();
        return true;
      }

      // If trying to access a different route than what's in the database
      if (route.routeConfig?.path && `/${route.routeConfig.path}` !== currentRoute) {
        // If we're on the results page and trying to go somewhere else, allow it
        if (currentRoute === '/results') {
          this.loadingService.hide();
          return true;
        }
        // Otherwise, redirect to the current route from the database
        console.log(`Redirecting to ${currentRoute} from ${route.routeConfig.path}`);
        this.router.navigate([currentRoute]);
        this.loadingService.hide();
        return false;
      }

      this.loadingService.hide();
      return true;
    } catch (error) {
      console.error('Error checking route access:', error);
      this.router.navigate(['/context']);
      this.loadingService.hide();
      return false;
    }
  }
}
