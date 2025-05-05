import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BaseService } from './base.service';
import { UserService } from './user.service';
import { RoundChallenge, RoundData, ChallengeResponse } from '../models/challenge.model';
import { RoundGeneratorService, GeneratedRound, GeneratedChallenge } from './round-generator.service';
import { RoundEvaluationService, EvaluationResponse } from './round-evaluation.service';

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
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengeService extends BaseService {
  private readonly COLLECTION = 'challenges';
  private readonly COLLECTION_NAME = 'challenges';
  private readonly DEFAULT_ROUNDS = 4; // Default number of rounds

  constructor(
    protected override firestore: Firestore,
    private userService: UserService,
    private roundGeneratorService: RoundGeneratorService,
    private roundEvaluationService: RoundEvaluationService
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

  async evaluateResponse(roundNumber: number, userResponse: string, challengeId: string): Promise<EvaluationResponse> {
    try {
      // Get the current user ID
      const userId = this.userService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID found');
      }

      // Get the challenge to access the question
      const challenge = await this.getChallenge(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Get the question for this round
      const question = challenge.questions[roundNumber - 1];
      if (!question) {
        throw new Error('No question found for this round');
      }

      // Generate AI response
      const aiResponse = await this.generateAIResponse(challengeId);

      // Use the RoundEvaluationService to evaluate the response
      const evaluation = await this.roundEvaluationService.evaluateResponse({
        userId,
        challengeId,
        roundNumber,
        question,
        userResponse,
        aiResponse
      });

      return evaluation;
    } catch (error) {
      console.error('Error evaluating response:', error);
      // Return a default evaluation in case of error
      return {
        metrics: {
          creativity: Math.random() * 100,
          practicality: Math.random() * 100,
          depth: Math.random() * 100,
          humanEdge: Math.random() * 100,
          overall: Math.random() * 100
        },
        feedback: ['An error occurred during evaluation.'],
        strengths: ['Response submitted successfully.'],
        improvements: ['Try again with a more detailed response.'],
        comparison: {
          userScore: Math.random() * 100,
          rivalScore: Math.random() * 100,
          advantage: 'tie',
          advantageReason: 'Evaluation could not be completed.'
        },
        badges: ['Participant']
      };
    }
  }

  async saveRoundResponse(userId: string, roundNumber: number, data: ChallengeResponse): Promise<void> {
    console.log(`Saving response for user ${userId}, round ${roundNumber}`);

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
    console.log('Response saved successfully');

    // Get the challenge to determine the maximum number of rounds
    const challenge = await this.getChallenge(data.challengeId);
    const maxRounds = challenge?.questions.length || 4;
    console.log(`Max rounds: ${maxRounds}`);

    // Determine next route
    const nextRoute = roundNumber < maxRounds ? `/round/${roundNumber + 1}` : '/results';
    console.log(`Next route: ${nextRoute}`);
  }

  async getRoundResponse(userId: string, roundNumber: number): Promise<ChallengeResponse | null> {
    return this.getDocument(this.COLLECTION, `${userId}_round${roundNumber}`);
  }

  async getAllRoundResponses(userId: string): Promise<ChallengeResponse[]> {
    // Get the current challenge to determine the number of rounds
    const challengeId = localStorage.getItem('currentChallengeId');
    if (!challengeId) {
      return [];
    }

    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      return [];
    }

    const maxRounds = challenge.questions.length;

    // Get all round responses
    const responses: ChallengeResponse[] = [];
    for (let i = 1;i <= maxRounds;i++) {
      const response = await this.getRoundResponse(userId, i);
      if (response) {
        responses.push(response);
      }
    }
    return responses;
  }

  async createChallenge(focusData: FocusData): Promise<string> {
    const userId = this.userService.getCurrentUserId();
    if (!userId) throw new Error('No user ID found');

    const challenge: Challenge = {
      id: '',
      userId,
      focus: focusData,
      rounds: [],
      description: focusData.description,
      questions: [],
      currentRound: 1,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const challengeId = await this.createDocument(this.COLLECTION_NAME, challenge);
    return challengeId;
  }

  async updateChallengeStatus(challengeId: string, status: 'pending' | 'in-progress' | 'completed'): Promise<void> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    await this.updateDocument(this.COLLECTION_NAME, challengeId, {
      status,
      updatedAt: new Date()
    });
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
    console.log('Current round:', currentRound);

    // Validate that we have a question for this round
    if (!challenge.questions || !challenge.questions[currentRound - 1]) {
      console.error('No question found for round:', currentRound);
      throw new Error('No question found for this round');
    }

    // Generate AI response
    const aiResponse = await this.generateAIResponse(challengeId);

    // Evaluate the response using the RoundEvaluationService
    const evaluation = await this.evaluateResponse(currentRound, response, challengeId);

    // Create round data
    const roundData: RoundData = {
      roundNumber: currentRound,
      question: challenge.questions[currentRound - 1],
      answer: response,
      aiResponse,
      evaluation
    };

    // Get existing rounds or initialize empty array
    const rounds = challenge.rounds || [];

    // Update or add the round data
    const roundIndex = rounds.findIndex(r => r.roundNumber === currentRound);
    if (roundIndex >= 0) {
      rounds[roundIndex] = roundData;
    } else {
      rounds.push(roundData);
    }

    // Update the entire challenge document
    await this.updateDocument(this.COLLECTION, challengeId, {
      rounds: rounds,
      currentRound: currentRound + 1,
      updatedAt: new Date()
    });

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

    // Update user's route if needed
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      const maxRounds = challenge.questions.length;
      const nextRoute = currentRound < maxRounds ? `/round/${currentRound + 1}` : '/results';
    }

    return challengeResponse;
  }
}
