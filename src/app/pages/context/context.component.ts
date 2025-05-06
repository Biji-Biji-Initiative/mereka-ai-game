import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-context',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './context.component.html',
  styleUrl: './context.component.scss'
})
export class ContextComponent {
  contextForm: FormGroup;
  isSubmitting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.contextForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      professionalTitle: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get formControls() {
    return this.contextForm.controls;
  }

  async onSubmit() {
    if (this.contextForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const userId = await this.userService.createUser(this.contextForm.value);
      const nextRoute = this.route.snapshot.data['next'];
      this.router.navigate([nextRoute]);
    } catch (error) {
      console.error('Error saving context:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
