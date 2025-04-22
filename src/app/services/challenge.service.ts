import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BaseService } from './base.service';
import { UserService } from './user.service';
import { RoundChallenge, RoundData, ChallengeResponse } from '../models/challenge.model';

export interface FocusData {
  focusArea: string;
  description: string;
}

export interface Challenge {
  id: string;
  userId: string;
  focus: FocusData;
  rounds: RoundData[];
  description: string;
  questions: string[];
  currentRound: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengeService extends BaseService {
  private readonly COLLECTION = 'challenges';
  private readonly COLLECTION_NAME = 'challenges';

  constructor(
    protected override firestore: Firestore,
    private userService: UserService
  ) {
    super(firestore);
  }

  async generateChallenge(focusArea: string): Promise<RoundChallenge> {
    const challenge: RoundChallenge = {
      id: '',
      title: `Challenge for ${focusArea}`,
      description: `A challenge focused on ${focusArea}`,
      aiResponse: '',
      steps: []
    };

    const challengeId = await this.createDocument(this.COLLECTION_NAME, challenge);
    challenge.id = challengeId;
    return challenge;
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
    // Save the complete response data including question, answer, AI response, and evaluation
    const responseData = {
      userId,
      roundNumber,
      challengeId: data.challengeId,
      question: data.question || '',
      response: data.response,
      aiResponse: data.aiResponse || '',
      evaluation: data.evaluation || null,
      timestamp: new Date()
    };

    await this.createDocument(this.COLLECTION, responseData);

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

    // Generate questions based on focus area
    const questions = this.generateAllQuestions(focusData.focusArea);

    // Create initial challenge data
    const challenge: Challenge = {
      id: '',
      userId,
      focus: focusData,
      rounds: [],
      description: focusData.description,
      questions,
      currentRound: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create the challenge document
    const challengeId = await this.createDocument(this.COLLECTION, challenge);

    // Update the challenge with its ID
    await this.updateDocument(this.COLLECTION, challengeId, { id: challengeId });

    // Save the current challenge ID to the user's document
    await this.userService.updateUserRoute(userId, '/round1');
    await this.updateDocument('users', userId, { currentChallengeId: challengeId });

    return challengeId;
  }

  private generateAllQuestions(focusArea: string): string[] {
    // Generate 4 different questions based on the focus area
    switch (focusArea) {
      case 'creative':
        return [
          'How would you solve a complex problem in a creative way that AI might not think of?',
          'What unique perspective could you bring to this creative challenge?',
          'How would you combine different ideas to create something innovative?',
          'What unexpected approach would you take to solve this problem?'
        ];
      case 'analytical':
        return [
          'Analyze this logical problem and explain your reasoning step by step.',
          'What patterns do you observe in this analytical challenge?',
          'How would you break down this complex problem into manageable parts?',
          'What data would you need to make a well-informed decision?'
        ];
      case 'emotional':
        return [
          'How would you handle this emotionally challenging situation?',
          'What emotional intelligence skills would you apply in this scenario?',
          'How would you balance emotional and rational considerations?',
          'What empathetic approach would you take to resolve this situation?'
        ];
      case 'ethical':
        return [
          'What ethical considerations would you take into account in this scenario?',
          'How would you balance competing ethical principles in this situation?',
          'What potential ethical dilemmas might arise from this decision?',
          'How would you ensure your solution respects all stakeholders?'
        ];
      default:
        return [
          'Please provide your response to this challenge.',
          'How would you approach this problem?',
          'What insights can you bring to this situation?',
          'How would you evaluate the success of your solution?'
        ];
    }
  }

  async addRound(challengeId: string, roundData: RoundData): Promise<void> {
    await this.updateDocument(this.COLLECTION_NAME, challengeId, {
      [`rounds.${roundData.roundNumber}`]: roundData
    });
  }

  async getChallenge(challengeId: string): Promise<Challenge | null> {
    return this.getDocument(this.COLLECTION, challengeId);
  }

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    return this.queryDocuments(this.COLLECTION, 'userId', userId);
  }

  async saveResponse(response: ChallengeResponse): Promise<void> {
    await this.createDocument('responses', response);
  }

  async getCurrentRound(): Promise<number> {
    const challengeId = localStorage.getItem('mereka_challenge_id');
    if (!challengeId) return 1;
    const challenge = await this.getChallenge(challengeId);
    return challenge?.currentRound || 1;
  }

  setCurrentRound(round: number): void {
    const challengeId = localStorage.getItem('mereka_challenge_id');
    if (!challengeId) return;
    this.updateDocument(this.COLLECTION, challengeId, { currentRound: round });
  }

  async submitResponse(challengeId: string, response: string): Promise<ChallengeResponse> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Get the current round number from the challenge
    const currentRound = challenge.currentRound;

    // Generate AI response
    const aiResponse = await this.generateAIResponse(challengeId);

    // Evaluate the response
    const evaluation = await this.evaluateResponse(currentRound, response, challengeId);

    // Create round data
    const roundData: RoundData = {
      roundNumber: currentRound,
      question: challenge.questions[currentRound - 1],
      answer: response,
      aiResponse,
      evaluation
    };

    // Add the round data to the challenge
    await this.addRound(challengeId, roundData);

    // Create the challenge response
    const challengeResponse: ChallengeResponse = {
      challengeId,
      response,
      aiResponse,
      evaluation,
      question: challenge.questions[currentRound - 1]
    };

    // Save the response
    await this.saveResponse(challengeResponse);

    // Update the current round in the challenge
    await this.updateDocument(this.COLLECTION, challengeId, {
      currentRound: currentRound + 1,
      updatedAt: new Date()
    });

    return challengeResponse;
  }
}
