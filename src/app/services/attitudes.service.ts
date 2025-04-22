import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BaseService } from './base.service';
import { UserService } from './user.service';

export interface AttitudeAnswer {
    questionId: number;
    answer: number;
}

export interface AttitudesData {
    answers: AttitudeAnswer[];
    questions: any[];
}

@Injectable({
    providedIn: 'root'
})
export class AttitudesService extends BaseService {
    private readonly COLLECTION = 'attitudes';

    constructor(
        protected override firestore: Firestore,
        private userService: UserService
    ) {
        super(firestore);
    }

    async saveAttitudes(userId: string, data: AttitudesData): Promise<void> {
        await this.createDocument(this.COLLECTION, {
            userId,
            ...data
        });

        // Update user's current route
        await this.userService.updateUserRoute(userId, '/focus');
    }

    async getAttitudes(userId: string): Promise<AttitudesData | null> {
        return this.getDocument(this.COLLECTION, userId);
    }
}
