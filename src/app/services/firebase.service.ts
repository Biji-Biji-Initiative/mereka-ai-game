import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db;

  constructor() {
    const firebaseConfig = {
      ...environment.firebase
    };
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  async createUser(contextData: any): Promise<string> {
    try {
      // Create a new user document
      const userRef = doc(collection(this.db, 'users'));
      const userId = userRef.id;

      // Save initial user data with context
      await setDoc(userRef, {
        ...contextData,
        createdAt: serverTimestamp(),
        currentRoute: '/traits',
        isAnonymous: true
      });

      return userId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserRoute(userId: string, route: string): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        currentRoute: route
      });
    } catch (error) {
      console.error('Error updating user route:', error);
      throw error;
    }
  }

  async saveTraitsData(userId: string, traitsData: any): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        traits: traitsData,
        currentRoute: '/attitudes'
      });
    } catch (error) {
      console.error('Error saving traits data:', error);
      throw error;
    }
  }

  async saveAttitudesData(userId: string, attitudesData: any): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        attitudes: attitudesData,
        currentRoute: '/focus'
      });
    } catch (error) {
      console.error('Error saving attitudes data:', error);
      throw error;
    }
  }

  async saveFocusData(userId: string, focusData: any): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        focus: focusData,
        currentRoute: '/round1'
      });
    } catch (error) {
      console.error('Error saving focus data:', error);
      throw error;
    }
  }

  async saveRoundData(userId: string, roundNumber: number, roundData: any): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const nextRoute = roundNumber < 3 ? `/round${roundNumber + 1}` : '/results';

      await updateDoc(userRef, {
        [`round${roundNumber}`]: roundData,
        currentRoute: nextRoute
      });
    } catch (error) {
      console.error('Error saving round data:', error);
      throw error;
    }
  }

  async getUserData(userId: string): Promise<any> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }
}
