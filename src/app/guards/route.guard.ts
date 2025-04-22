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

      // If trying to access a different route than what's in the database
      if (route.routeConfig?.path && `/${route.routeConfig.path}` !== currentRoute) {
        // Redirect to the current route from the database
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
