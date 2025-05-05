import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { User } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class StateService {
    private userSubject = new BehaviorSubject<User | null>(null);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    user$ = this.userSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    constructor(private userService: UserService) {
        this.initializeUser();
    }

    private async initializeUser() {
        this.loadingSubject.next(true);
        try {
            const userId = localStorage.getItem('mereka_user_id');
            if (userId) {
                const user = await this.userService.getUser(userId);
                this.userSubject.next(user);
            }
        } catch (error) {
            console.error('Error initializing user:', error);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    setUser(user: User | null) {
        this.userSubject.next(user);
    }

    getUser(): User | null {
        return this.userSubject.value;
    }

    getUserId(): string | null {
        return this.userSubject.value?.id || null;
    }

    isLoading(): boolean {
        return this.loadingSubject.value;
    }
}
