import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-context',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './context.component.html',
  styleUrl: './context.component.scss'
})
export class ContextComponent {
  userContext = {
    name: '',
    email: '',
    professionalTitle: '',
    location: ''
  };
  isSubmitting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  async onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const userId = await this.userService.createUser(this.userContext);
      const nextRoute = this.route.snapshot.data['next'];
      this.router.navigate([nextRoute]);
    } catch (error) {
      console.error('Error saving context:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
