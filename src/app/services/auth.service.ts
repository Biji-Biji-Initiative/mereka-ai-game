import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private currentUser: User | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private auth: Auth
  ) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.isAuthenticatedSubject.next(!!user);
      if (user) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', user.email || '');
      } else {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
      }
    });
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async createAccountWithEmail(email: string, password: string): Promise<void> {
    try {
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Get the current user ID from localStorage (created during context screen)
      const userId = this.userService.getCurrentUserId();

      if (userId) {
        // Update the existing user document with auth ID
        await this.userService.updateUserAuthId(userId, user.uid);
      } else {
        console.error('No user ID found in localStorage');
        throw new Error('User not found');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      // Find user document by auth ID
      const user = await this.userService.getUserByAuthId(this.currentUser?.uid || '');
      if (user) {
        localStorage.setItem('mereka_user_id', user.id);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;

      // Get the current user ID from localStorage (created during context screen)
      const userId = this.userService.getCurrentUserId();

      if (userId) {
        // Update the existing user document with auth ID
        await this.userService.updateUserAuthId(userId, user.uid);
      } else {
        // Check if user already exists with this auth ID
        const existingUser = await this.userService.getUserByAuthId(user.uid);
        if (existingUser) {
          localStorage.setItem('mereka_user_id', existingUser.id);
        } else {
          //logout and throw error
          await signOut(this.auth);
          console.error('No user ID found in localStorage');
          throw new Error('User not found');
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.userService.clearCurrentUser();
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}
