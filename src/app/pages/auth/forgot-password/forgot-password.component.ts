import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">Reset your password</h2>
          <p class="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              [(ngModel)]="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter your email"
            >
          </div>

          <div>
            <button
              type="submit"
              [disabled]="!isEmailValid()"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Reset Link
            </button>
          </div>
        </form>

        <div *ngIf="submitted" class="mt-4 p-4 rounded-md bg-green-50 text-green-700">
          <p>If an account exists for {{ email }}, you will receive password reset instructions.</p>
        </div>

        <p class="mt-6 text-center text-sm text-gray-600">
          Remember your password?
          <a routerLink="/auth/login" class="font-medium text-primary hover:text-primary-dark">
            Sign in
          </a>
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
    email = '';
    submitted = false;

    isEmailValid(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    onSubmit() {
        if (this.isEmailValid()) {
            // Handle password reset request
            console.log('Password reset requested for:', this.email);
            this.submitted = true;
        }
    }
}
