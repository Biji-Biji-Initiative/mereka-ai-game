import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
          <p class="mt-2 text-sm text-gray-600">
            Join AI Fight Club and start your journey
          </p>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                [(ngModel)]="name"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your full name"
              >
            </div>

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
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Create a password"
              >
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                [(ngModel)]="confirmPassword"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Confirm your password"
              >
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              [(ngModel)]="acceptTerms"
              required
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            >
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              I agree to the
              <a href="/terms" class="text-primary hover:text-primary-dark">Terms of Service</a>
              and
              <a href="/privacy" class="text-primary hover:text-primary-dark">Privacy Policy</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="!isFormValid()"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              (click)="registerWithGoogle()"
            >
              <img src="assets/google-icon.svg" class="h-5 w-5 mr-2" alt="Google logo">
              Google
            </button>
          </div>
        </div>

        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <a routerLink="/auth/login" class="font-medium text-primary hover:text-primary-dark">
            Sign in
          </a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;

  isFormValid(): boolean {
    return (
      this.name.trim() !== '' &&
      this.email.trim() !== '' &&
      this.password.length >= 8 &&
      this.password === this.confirmPassword &&
      this.acceptTerms
    );
  }

  onSubmit() {
    if (this.isFormValid()) {
      // Handle form submission
      console.log('Register submitted', {
        name: this.name,
        email: this.email,
        password: this.password,
        acceptTerms: this.acceptTerms
      });
    }
  }

  registerWithGoogle() {
    // Handle Google registration
    console.log('Register with Google clicked');
  }
}
