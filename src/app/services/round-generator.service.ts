import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Firestore, collection, query, where, getDocs, orderBy, limit } from '@angular/fire/firestore';
import { RoundData, Challenge } from '../models/challenge.model';
import { CloudFunctionPayload, RoundGenerationOptionsPayload } from '../models/cloud-function-payload.model';
import { User, TraitQuestion, AttitudeQuestion } from '../models/user.model';

export interface GeneratedChallenge {
  id: string;
  question: string;
  type: string;
  points: number;
}

export interface GeneratedRound {
  id: string;
  title: string;
  description: string;
  type: string;
  context: string;
  difficulty: number;
  challenges: GeneratedChallenge[];
  estimatedTime: number;
}

interface CloudFunctionResponse {
  success: boolean;
  data: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
        refusal: any;
        annotations: any[];
      };
      logprobs: any;
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class RoundGeneratorService {
  private readonly API_URL = `${environment.apiUrl}/processRequest`;
  private readonly TIMEOUT_MS = 300000; // 30 seconds timeout

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private firestore: Firestore
  ) { }

  async generateRound(focusArea: string, roundNumber: string, context?: string, previousRounds?: any[]): Promise<GeneratedRound> {
    try {
      // Get current user ID
      const userId = this.userService.getCurrentUserId();
      if (!userId) throw new Error('No user ID found');

      // Fetch user data from the database
      const userProfile = await this.userService.getUser(userId);
      if (!userProfile) throw new Error('User not found');

      // Validate focus area
      if (!focusArea) {
        throw new Error('Focus area is required');
      }

      // Format traits and attitudes according to payload model
      const formattedTraits = {
        answers: userProfile.traits?.answers?.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer
        })) || [],
        questions: userProfile.traits?.questions?.map(question => ({
          id: question.id,
          text: question.title,
          options: question.options?.minLabel && question.options?.maxLabel
            ? [question.options.minLabel, question.options.maxLabel]
            : []
        })) || []
      };

      const formattedAttitudes = {
        answers: userProfile.attitudes?.answers?.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer
        })) || [],
        questions: userProfile.attitudes?.questions?.map(question => ({
          id: question.id,
          text: question.title,
          options: question.options?.minLabel && question.options?.maxLabel
            ? [question.options.minLabel, question.options.maxLabel]
            : []
        })) || []
      };

      // Create a structured request for the cloud function
      const request = this.createStructuredRequest({
        userId,
        focusType: focusArea,
        context: context || `Generate a challenge focused on ${focusArea} for round ${roundNumber}`,
        userProfile: {
          name: userProfile.name,
          email: userProfile.email,
          professionalTitle: userProfile.professionalTitle,
          location: userProfile.location,
          currentRoute: '/rounds',
          isAnonymous: false
        },
        traits: formattedTraits,
        attitudes: formattedAttitudes,
        options: this.getRoundGenerationOptions(roundNumber, previousRounds),
        previousRounds: previousRounds || []
      });

      // Call the cloud function with timeout
      const response = await this.http.post<CloudFunctionResponse>(
        this.API_URL,
        request
      )
        .pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            console.error('Error generating round:', error);
            return throwError(error);
          })
        )
        .toPromise();

      if (!response?.success) {
        throw new Error('Failed to generate round');
      }

      // Parse the response content
      const content = response.data.choices[0].message.content;

      // Clean the content to ensure it's valid JSON
      const cleanedContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      let question: string;
      try {
        const questions = JSON.parse(cleanedContent);
        question = questions[0]; // Get the first question
      } catch (parseError) {
        console.error('Error parsing question:', parseError);
        throw new Error('Invalid question response format');
      }

      // Create the generated round with a challenge
      const roundId = 'round-' + Date.now();
      const challenge: GeneratedChallenge = {
        id: `challenge-1`,
        question: question,
        type: 'open-ended',
        points: this.calculatePoints(roundNumber)
      };

      // Return the generated round
      return {
        id: roundId,
        title: `${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)} Challenge`,
        description: `A challenge focused on ${focusArea}`,
        type: 'scenario',
        context: context || 'general',
        difficulty: parseInt(roundNumber),
        challenges: [challenge],
        estimatedTime: 20
      };
    } catch (error) {
      console.error('Error generating round:', error);
      throw error;
    }
  }

  private async getUserChallengeHistory(userId: string): Promise<any[]> {
    try {
      const challengesRef = collection(this.firestore, 'challenges');
      const q = query(
        challengesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          question: data['question'],
          answer: data['answer'],
          evaluation: data['evaluation']
        };
      });
    } catch (error) {
      console.error('Error fetching challenge history:', error);
      return [];
    }
  }

  private getRoundGenerationOptions(roundNumber: string, previousRounds?: any[]): RoundGenerationOptionsPayload {
    const difficulty = this.calculateDifficulty(roundNumber, previousRounds);
    const creativeVariation = this.calculateCreativeVariation(roundNumber, previousRounds);

    return {
      roundTypes: [
        "scenario", "reflection", "problem-solving", "decision-making",
        "self-assessment", "hypothetical", "analytical", "creative"
      ],
      difficultyLevels: [difficulty],
      contextCategories: [
        "personal", "professional", "educational", "social",
        "emotional", "ethical", "cultural", "environmental"
      ],
      focusAreas: [
        "leadership", "communication", "teamwork", "problem-solving",
        "adaptability", "creativity", "emotional intelligence", "critical thinking"
      ],
      challengeFormats: [
        "open-ended", "scenario-based", "reflection",
        "self-assessment", "hypothetical", "analytical", "creative"
      ],
      answerTypes: [
        "text", "rating", "ranking"
      ]
    };
  }

  private calculateDifficulty(roundNumber: string, previousRounds?: any[]): string {
    const roundNum = parseInt(roundNumber);
    if (roundNum === 1) return 'beginner';
    if (roundNum === 2) return 'intermediate';
    if (roundNum === 3) return 'advanced';

    // If we have previous rounds, use their performance to adjust difficulty
    if (previousRounds && previousRounds.length > 0) {
      const lastRound = previousRounds[previousRounds.length - 1];
      if (lastRound.evaluation?.metrics?.overall >= 80) return 'advanced';
      if (lastRound.evaluation?.metrics?.overall >= 60) return 'intermediate';
    }

    return 'intermediate';
  }

  private calculateCreativeVariation(roundNumber: string, previousRounds?: any[]): number {
    const roundNum = parseInt(roundNumber);
    if (roundNum === 1) return 0.6;
    if (roundNum === 2) return 0.7;
    if (roundNum === 3) return 0.8;

    // If we have previous rounds, use their performance to adjust creativity
    if (previousRounds && previousRounds.length > 0) {
      const lastRound = previousRounds[previousRounds.length - 1];
      if (lastRound.evaluation?.metrics?.overall >= 80) return 0.9;
      if (lastRound.evaluation?.metrics?.overall >= 60) return 0.8;
    }

    return 0.7;
  }

  private calculatePoints(roundNumber: string): number {
    const roundNum = parseInt(roundNumber);
    return 10 + (roundNum * 5); // Base 10 points + 5 points per round
  }

  private createStructuredRequest(payload: CloudFunctionPayload): any {
    // Build the challenge prompt
    let prompt = `### CHALLENGE GENERATION TASK\n\n`;
    prompt += `Generate a challenge for effective AI communication based on the user's profile and history. The challenge should be appropriate for the specified difficulty level and focus area.\n\n`;

    // Add user profile section
    prompt += `### USER PROFILE\n`;
    if (payload.userProfile?.professionalTitle) {
      prompt += `Professional Title: ${payload.userProfile.professionalTitle}\n`;
    }
    if (payload.userProfile?.location) {
      prompt += `Location: ${payload.userProfile.location}\n`;
    }

    // Add personality traits if available
    if (payload.traits && Object.keys(payload.traits).length > 0) {
      prompt += `\nPersonality Traits (scale 1-10):\n`;
      for (const [trait, value] of Object.entries(payload.traits)) {
        if (trait === 'answers' && Array.isArray(value)) {
          const answers = value.map((v: any) => v.answer).join(', ');
          prompt += `- Trait Scores: ${answers}\n`;
        } else if (trait === 'questions' && Array.isArray(value)) {
          const questions = value.map((q: any) =>
            q.subtitle ? `${q.title}: ${q.subtitle}` : q.title
          ).join('\n  ');
          prompt += `- Trait Questions:\n  ${questions}\n`;
        }
      }
    }

    // Add attitudes toward AI if available
    if (payload.attitudes && Object.keys(payload.attitudes).length > 0) {
      prompt += `\nAttitudes Toward AI (scale 1-10):\n`;
      for (const [attitude, value] of Object.entries(payload.attitudes)) {
        if (attitude === 'answers' && Array.isArray(value)) {
          const answers = value.map((v: any) => v.answer).join(', ');
          prompt += `- Attitude Scores: ${answers}\n`;
        } else if (attitude === 'questions' && Array.isArray(value)) {
          const questions = value.map((q: any) =>
            q.subtitle ? `${q.title}: ${q.subtitle}` : q.title
          ).join('\n  ');
          prompt += `- Attitude Questions:\n  ${questions}\n`;
        }
      }
    }
    prompt += `\n`;

    // Add challenge parameters
    prompt += `### CHALLENGE PARAMETERS\n`;
    prompt += `Focus Area: ${payload.focusType}\n`;
    prompt += `Difficulty: ${payload.options.difficultyLevels[0]}\n`;
    if (payload.context) {
      prompt += `Context: ${payload.context}\n`;
    }
    prompt += `\n`;

    // Add previous rounds if available
    if (payload.previousRounds && payload.previousRounds.length > 0) {
      prompt += `### PREVIOUS ROUNDS\n`;
      payload.previousRounds.forEach((round, index) => {
        prompt += `Round ${index + 1}:\n`;
        if (round.question) {
          prompt += `- Question: ${round.question}\n`;
        }
        if (round.answer) {
          prompt += `- User's Answer: ${round.answer}\n`;
        }
        if (round.evaluation) {
          prompt += `- Evaluation: ${JSON.stringify(round.evaluation)}\n`;
        }
        prompt += `\n`;
      });
    }

    // Add creativity guidance
    prompt += `### CREATIVITY GUIDANCE\n`;
    const creativeVariation = this.calculateCreativeVariation('1', payload.previousRounds);
    prompt += `- Variation level: ${Math.floor(creativeVariation * 100)}%\n`;
    if (creativeVariation > 0.8) {
      prompt += `- Generate highly creative and unique challenges.\n`;
    } else if (creativeVariation > 0.6) {
      prompt += `- Balance creativity with structured learning.\n`;
    } else {
      prompt += `- Focus on foundational concepts with moderate creativity.\n`;
    }
    prompt += `\n`;

    // Add adaptation guidance
    prompt += `### ADAPTATION GUIDANCE\n`;
    prompt += `- Create a challenge that builds on the user's previous performance.\n`;
    prompt += `- Consider the patterns in previous rounds when generating the challenge.\n`;
    prompt += `- Ensure appropriate difficulty for the current round.\n`;
    if (payload.previousRounds && payload.previousRounds.length > 0) {
      prompt += `- Reference patterns from the user's previous rounds when relevant.\n`;
    }
    prompt += `\n`;

    // Add response format instructions
    prompt += `### RESPONSE FORMAT\n`;
    prompt += `Return a single challenge question as a JSON array with one string element. The question should:\n`;
    prompt += `1. Be clear and concise\n`;
    prompt += `2. Be open-ended\n`;
    prompt += `3. Be appropriate for the specified difficulty level\n`;
    prompt += `4. Focus on the specified focus area\n`;
    prompt += `5. Encourage thoughtful responses\n\n`;
    prompt += `Example format:\n`;
    prompt += `["Your challenge question here"]\n\n`;

    // Create the system message
    const systemMessage = {
      role: 'system',
      content: `You are an AI challenge creator specializing in ${payload.focusType} challenges. Your task is to generate an engaging and appropriately challenging question that helps users improve their interaction with AI systems.`
    };

    // Create the user message
    const userMessage = {
      role: 'user',
      content: prompt
    };

    // Return the complete request
    return {
      type: 'generateChallenge',
      model: "gpt-4o",
      messages: [systemMessage, userMessage],
      temperature: 0.5
    };
  }
}
