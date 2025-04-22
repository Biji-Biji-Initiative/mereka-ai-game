import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, UserContext } from '../../services/user.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-context',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './context.component.html',
  styleUrl: './context.component.scss'
})
export class ContextComponent {
  userContext: UserContext = {
    name: '',
    email: '',
    professionalTitle: '',
    location: ''
  };

  isSubmitting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private navigationService: NavigationService
  ) { }

  async onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      // Create user and save context data
      const userId = await this.userService.createUser(this.userContext);

      // Navigate to next route using the navigation service
      const nextRoute = this.route.snapshot.data['next'];
      await this.navigationService.navigateToNextRoute('context', nextRoute);
    } catch (error) {
      console.error('Error saving context:', error);
      // Handle error appropriately
    } finally {
      this.isSubmitting = false;
    }
  }
}
