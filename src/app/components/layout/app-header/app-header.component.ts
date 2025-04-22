import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
  isAuthenticated = true; // This will be connected to auth service later

  constructor(private router: Router) { }

  logout() {
    // This will be connected to auth service later
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }

  resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      // This will be connected to game service later
      console.log('Game reset requested by user');
      this.router.navigate(['/']);
    }
  }
}
