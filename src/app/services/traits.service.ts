import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BaseService } from './base.service';
import { UserService } from './user.service';

export interface TraitAnswer {
    questionId: number;
    answer: number;
}

export interface TraitsData {
    answers: TraitAnswer[];
    questions: any[];
}

@Injectable({
    providedIn: 'root'
})
export class TraitsService extends BaseService {
    private readonly COLLECTION = 'traits';

    constructor(
        protected override firestore: Firestore,
        private userService: UserService
    ) {
        super(firestore);
    }

    async saveTraits(userId: string, data: TraitsData): Promise<void> {
        await this.createDocument(this.COLLECTION, {
            userId,
            ...data
        });
    }

    async getTraits(userId: string): Promise<TraitsData | null> {
        return this.getDocument(this.COLLECTION, userId);
    }
}
