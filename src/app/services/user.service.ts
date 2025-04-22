import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

export interface UserContext {
  name: string;
  email: string;
  professionalTitle: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  private readonly COLLECTION = 'users';

  async createUser(context: UserContext): Promise<string> {
    const userId = await this.createDocument(this.COLLECTION, {
      ...context,
      currentRoute: '/traits',
      isAnonymous: true
    });

    // Store userId in localStorage
    localStorage.setItem('mereka_user_id', userId);
    return userId;
  }

  async updateUserRoute(userId: string, route: string): Promise<void> {
    console.log(`Updating user ${userId} route to: ${route}`);
    // Ensure route starts with a slash
    const routeWithSlash = (route ? (route.startsWith('/') ? route : `/${route}`) : '');
    await this.updateDocument(this.COLLECTION, userId, { currentRoute: routeWithSlash });
  }

  async getUser(userId: string): Promise<any> {
    return this.getDocument(this.COLLECTION, userId);
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('mereka_user_id');
  }

  clearCurrentUser(): void {
    localStorage.removeItem('mereka_user_id');
  }
}
