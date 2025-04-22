import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BaseService } from './base.service';
import { UserService } from './user.service';

export interface ChallengeResponse {
  challengeId: string;
  response: string;
  aiResponse?: string;
  evaluation?: any;
}

export interface FocusData {
  focusArea: string;
  description: string;
}

export interface RoundData {
  roundNumber: number;
  question: string;
  answer: string;
  feedback?: string;
}

export interface Challenge {
  id: string;
  userId: string;
  focus: FocusData;
  rounds: RoundData[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengeService extends BaseService {
  private readonly COLLECTION = 'challenges';

  constructor(
    protected override firestore: Firestore,
    private userService: UserService
  ) {
    super(firestore);
  }

  async generateChallenge(roundNumber: number): Promise<Challenge> {
    // This would typically call an API or use AI to generate a challenge
    // For now, we'll return a mock challenge
    return {
      id: '',
      userId: '',
      focus: {
        focusArea: '',
        description: ''
      },
      rounds: [],
      description: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async generateAIResponse(challengeId: string): Promise<string> {
    // This would typically call an API or use AI to generate a response
    // For now, we'll return a mock response
    return `This is a mock AI response for challenge ${challengeId}`;
  }

  async evaluateResponse(roundNumber: number, userResponse: string, challengeId: string): Promise<any> {
    // This would typically call an API or use AI to evaluate the response
    // For now, we'll return a mock evaluation
    return {
      metrics: {
        creativity: Math.random() * 5,
        practicality: Math.random() * 5,
        depth: Math.random() * 5,
        humanEdge: Math.random() * 5,
        overall: Math.random() * 5
      },
      feedback: ['Good job!', 'Keep it up!'],
      strengths: ['Creative thinking', 'Clear communication'],
      improvements: ['More detail', 'Better structure'],
      comparison: {
        userScore: Math.random() * 5,
        rivalScore: Math.random() * 5,
        advantage: Math.random() > 0.5 ? 'user' : 'rival',
        advantageReason: 'Better reasoning'
      },
      badges: ['Creative Thinker', 'Problem Solver']
    };
  }

  async saveRoundResponse(userId: string, roundNumber: number, data: ChallengeResponse): Promise<void> {
    await this.createDocument(this.COLLECTION, {
      userId,
      roundNumber,
      ...data
    });

    // Update user's current route
    const nextRoute = roundNumber < 3 ? `/round${roundNumber + 1}` : '/results';
    await this.userService.updateUserRoute(userId, nextRoute);
  }

  async getRoundResponse(userId: string, roundNumber: number): Promise<ChallengeResponse | null> {
    return this.getDocument(this.COLLECTION, `${userId}_round${roundNumber}`);
  }

  async getAllRoundResponses(userId: string): Promise<ChallengeResponse[]> {
    // This would need to be implemented with a query to get all rounds for a user
    // For now, we'll just get them one by one
    const responses: ChallengeResponse[] = [];
    for (let i = 1;i <= 3;i++) {
      const response = await this.getRoundResponse(userId, i);
      if (response) {
        responses.push(response);
      }
    }
    return responses;
  }

  async createChallenge(focusData: FocusData): Promise<string> {
    const userId = this.userService.getCurrentUserId();

    if (!userId) {
      throw new Error('User not found');
    }

    const challengeId = await this.createDocument(this.COLLECTION, {
      userId,
      focus: focusData,
      rounds: [],
      description: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return challengeId;
  }

  async addRound(challengeId: string, roundData: RoundData): Promise<void> {
    const challenge = await this.getDocument(this.COLLECTION, challengeId);

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const rounds = [...(challenge.rounds || []), roundData];

    await this.updateDocument(this.COLLECTION, challengeId, {
      rounds,
      updatedAt: new Date()
    });
  }

  async getChallenge(challengeId: string): Promise<Challenge | null> {
    return this.getDocument(this.COLLECTION, challengeId);
  }

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    return this.queryDocuments(this.COLLECTION, 'userId', userId);
  }
}
