import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AppLayoutComponent } from './components/layout/app-layout/app-layout.component';
import { UserService } from './services/user.service';
import { LoadingService } from './services/loading.service';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppLayoutComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'mereka-ai-game';

  constructor(
    private userService: UserService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {
    // Show loading indicator
    this.loadingService.show();

    // Check if user exists and redirect to their current route
    const userId = this.userService.getCurrentUserId();

    if (userId) {
      try {
        const user = await this.userService.getUser(userId);

        if (user && user.currentRoute) {
          // Get current URL path
          const currentPath = window.location.pathname;

          // If not already on the correct route, redirect
          if (currentPath !== user.currentRoute) {
            this.router.navigate([user.currentRoute]);
          }
        }
      } catch (error) {
        console.error('Error checking user route:', error);
      }
    }

    // Hide loading indicator
    this.loadingService.hide();
  }
}
