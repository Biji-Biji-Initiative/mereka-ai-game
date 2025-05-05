import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
    providedIn: 'root'
})
export class InitialSetupGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    canActivate(): boolean {
        const userId = this.userService.getCurrentUserId();
        if (userId) {
            // User is already logged in, redirect to dashboard
            this.router.navigate(['/dashboard']);
            return false;
        }
        // User is not logged in, allow access to welcome/context screens
        return true;
    }
}
