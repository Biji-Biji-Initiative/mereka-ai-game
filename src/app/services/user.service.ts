import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { TraitAnswer, TraitsData } from './traits.service';
import { AttitudeAnswer, AttitudesData } from './attitudes.service';

export interface UserContext {
  name: string;
  email: string;
  professionalTitle: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  professionalTitle: string;
  location: string;
  currentRoute: string;
  isAnonymous: boolean;
  authId: string | null;
  createdAt: any;
  updatedAt: any;
  traits?: TraitsData;
  attitudes?: AttitudesData;
  rounds?: {
    [key: string]: {
      comparison?: {
        differences?: string[];
        similarities?: string[];
      };
      decisions?: {
        [key: string]: any;
      };
      outcomes?: {
        [key: string]: any;
      };
    };
  };
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
      isAnonymous: true,
      authId: null,
      traits: null,
      attitudes: null,
      rounds: {}
    });

    // Store userId in localStorage
    localStorage.setItem('mereka_user_id', userId);
    return userId;
  }

  async getUser(userId: string): Promise<User | null> {
    const user = await this.getDocument(this.COLLECTION, userId);
    return user ? { ...user, id: userId } : null;
  }

  async getUserByAuthId(authId: string): Promise<User | null> {
    try {
      // Use the queryDocuments method from BaseService
      const users = await this.queryDocuments(this.COLLECTION, 'authId', authId);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting user by authId:', error);
      return null;
    }
  }

  async updateUserAuthId(userId: string, authId: string): Promise<void> {
    try {
      await this.updateDocument(this.COLLECTION, userId, {
        authId,
        isAnonymous: false
      });
    } catch (error) {
      console.error('Error updating user authId:', error);
      throw error;
    }
  }

  async updateUserTraits(userId: string, traits: TraitsData): Promise<void> {
    try {
      await this.updateDocument(this.COLLECTION, userId, { traits });
    } catch (error) {
      console.error('Error updating user traits:', error);
      throw error;
    }
  }

  async updateUserAttitudes(userId: string, attitudes: AttitudesData): Promise<void> {
    try {
      await this.updateDocument(this.COLLECTION, userId, { attitudes });
    } catch (error) {
      console.error('Error updating user attitudes:', error);
      throw error;
    }
  }

  async updateUserRound(userId: string, roundId: string, roundData: any): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      const rounds = user.rounds || {};
      rounds[roundId] = roundData;

      await this.updateDocument(this.COLLECTION, userId, { rounds });
    } catch (error) {
      console.error('Error updating user round:', error);
      throw error;
    }
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('mereka_user_id');
  }

  clearCurrentUser(): void {
    localStorage.removeItem('mereka_user_id');
  }

  getUserContext(): UserContext | null {
    const context = localStorage.getItem('userContext');
    return context ? JSON.parse(context) : null;
  }

  async getUserTraits(userId: string): Promise<TraitsData | null> {
    const user = await this.getUser(userId);
    return user?.traits || null;
  }

  async getUserAttitudes(userId: string): Promise<AttitudesData | null> {
    const user = await this.getUser(userId);
    return user?.attitudes || null;
  }
}
