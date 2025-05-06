import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Firestore, collection, query, where, getDocs, orderBy, limit } from '@angular/fire/firestore';

export interface FocusArea {
  id: string;
  name: string;
  description: string;
  matchLevel: number;
  icon: string;
  rationale: string;
  improvementStrategies: string[];
  recommendedChallengeTypes: string[];
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
export class FocusAreaGeneratorService {
  private readonly API_URL = `${environment.apiUrl}/processRequest`;
  private readonly TIMEOUT_MS = 300000; // 30 seconds timeout

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private firestore: Firestore
  ) { }

  async generateFocusAreas(): Promise<FocusArea[]> {
    const userId = this.userService.getCurrentUserId();
    if (!userId) throw new Error('No user ID found');

    // Get user's traits, attitudes, and details
    const user = await this.userService.getUser(userId);
    if (!user) throw new Error('User not found');

    // Get user's challenge history from Firestore
    const challengeHistory = await this.getUserChallengeHistory(userId);

    // Create a structured request for the cloud function
    const request = this.createStructuredRequest(user, challengeHistory);

    try {
      // Call the cloud function with timeout
      const response = await this.http.post<CloudFunctionResponse>(
        this.API_URL,
        request
      )
        .pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            console.error('Error generating focus areas:', error);
            return throwError(error);
          })
        )
        .toPromise();

      if (!response?.success) {
        throw new Error('Failed to generate focus areas');
      }

      // Parse the response content
      const content = response.data.choices[0].message.content;

      // Clean the content to ensure it's valid JSON
      const cleanedContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      console.log('Raw response content:', content);
      console.log('Cleaned content:', cleanedContent);

      let focusAreas: FocusArea[];
      try {
        focusAreas = JSON.parse(cleanedContent);
        console.log('Parsed focus areas:', focusAreas);
      } catch (parseError) {
        console.error('Error parsing focus areas:', parseError);
        console.error('Raw content:', content);
        throw new Error('Invalid focus areas response format');
      }

      if (!this.isValidFocusAreas(focusAreas)) {
        throw new Error('Invalid focus areas response structure');
      }

      return focusAreas;
    } catch (error) {
      console.error('Error generating focus areas:', error);
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
          focus_area: data['focus']?.['focusArea'],
          challengeType: data['focus']?.['recommendedChallengeTypes']?.[0],
          score: data['evaluation']?.['metrics']?.['overall'],
          strengths: data['evaluation']?.['strengths'] || [],
          areasForImprovement: data['evaluation']?.['improvements'] || []
        };
      });
    } catch (error) {
      console.error('Error fetching challenge history:', error);
      return [];
    }
  }

  private createStructuredRequest(user: User, challengeHistory: any[]): any {
    // Build the focus area prompt
    let prompt = `### FOCUS AREA GENERATION TASK\n\n`;
    prompt += `Generate personalized focus areas for effective AI communication based on the user's profile and history. Each focus area should represent a specific skill or topic the user should concentrate on to improve their interaction with AI systems.\n\n`;

    // Add user profile section
    prompt += `### USER PROFILE\n`;
    if (user.professionalTitle) {
      prompt += `Professional Title: ${user.professionalTitle}\n`;
    }
    if (user.location) {
      prompt += `Location: ${user.location}\n`;
    }

    // Add personality traits if available
    if (user.traits && Object.keys(user.traits).length > 0) {
      prompt += `\nPersonality Traits (scale 1-10):\n`;
      if (user.traits.answers && Array.isArray(user.traits.answers)) {
        const answers = user.traits.answers.map((v: any) => v.answer).join(', ');
        prompt += `- Trait Scores: ${answers}\n`;
      }
      if (user.traits.questions && Array.isArray(user.traits.questions)) {
        const questions = user.traits.questions.map((q: any) =>
          q.subtitle ? `${q.title}: ${q.subtitle}` : q.title
        ).join('\n  ');
        prompt += `- Trait Questions:\n  ${questions}\n`;
      }
    }

    // Add attitudes toward AI if available
    if (user.attitudes && Object.keys(user.attitudes).length > 0) {
      prompt += `\nAttitudes Toward AI (scale 1-10):\n`;
      if (user.attitudes.answers && Array.isArray(user.attitudes.answers)) {
        const answers = user.attitudes.answers.map((v: any) => v.answer).join(', ');
        prompt += `- Attitude Scores: ${answers}\n`;
      }
      if (user.attitudes.questions && Array.isArray(user.attitudes.questions)) {
        const questions = user.attitudes.questions.map((q: any) =>
          q.subtitle ? `${q.title}: ${q.subtitle}` : q.title
        ).join('\n  ');
        prompt += `- Attitude Questions:\n  ${questions}\n`;
      }
    }
    prompt += `\n`;

    // Add challenge history if available
    if (challengeHistory && challengeHistory.length > 0) {
      prompt += `### CHALLENGE HISTORY\n`;
      challengeHistory.forEach((challenge, index) => {
        prompt += `Challenge ${index + 1}:\n`;
        if (challenge.focus_area) {
          prompt += `- Focus Area: ${challenge.focus_area}\n`;
        }
        if (challenge.challengeType) {
          prompt += `- Type: ${challenge.challengeType}\n`;
        }
        if (challenge.score !== undefined) {
          prompt += `- Score: ${challenge.score}\n`;
        }
        if (challenge.strengths && challenge.strengths.length > 0) {
          prompt += `- Strengths: ${challenge.strengths.join(', ')}\n`;
        }
        if (challenge.areasForImprovement && challenge.areasForImprovement.length > 0) {
          prompt += `- Areas for Improvement: ${challenge.areasForImprovement.join(', ')}\n`;
        }
        prompt += `\n`;
      });
    }

    // Add creativity guidance
    prompt += `### CREATIVITY GUIDANCE\n`;
    prompt += `- Generate highly creative and unique focus areas beyond standard communication skills.\n`;
    prompt += `- Balance creativity with practical communication skills.\n`;
    prompt += `- Focus on foundational communication skills with moderate creativity.\n\n`;

    // Add personalization guidance
    prompt += `### PERSONALIZATION GUIDANCE\n`;
    prompt += `- Focus areas should be tailored specifically to this user's profile, traits, and history.\n`;
    prompt += `- Consider the user's professional context when suggesting focus areas.\n`;
    prompt += `- Include both strengths to leverage and areas that need improvement.\n`;
    prompt += `- Ensure the focus areas are diverse and cover different aspects of AI communication.\n`;
    if (challengeHistory && challengeHistory.length > 0) {
      prompt += `- Reference patterns from the user's challenge history when relevant.\n`;
    }
    prompt += `\n`;

    // Add response format instructions
    prompt += `### RESPONSE FORMAT\n`;
    prompt += `Return the focus areas as a JSON array with the following structure:\n\n`;
    prompt += `[
  {
    "id": "unique-id-1",
    "name": "Focus Area Name",
    "description": "Detailed description of the focus area",
    "matchLevel": number between 80-100,
    "icon": "emoji-icon",
    "rationale": "Explanation of why this focus area is important for this user",
    "improvementStrategies": [
      "Strategy 1 to improve in this focus area",
      "Strategy 2 to improve in this focus area"
    ],
    "recommendedChallengeTypes": [
      "challenge type 1",
      "challenge type 2"
    ]
  }
]\n\n`;

    // Create the system message
    const systemMessage = {
      role: 'system',
      content: `You are an AI learning strategist specializing in personalized focus area recommendations for AI communication skills. Your task is to generate focus areas that help users improve their interaction with AI systems.`
    };

    // Create the user message
    const userMessage = {
      role: 'user',
      content: prompt
    };

    // Return the complete request
    return {
      type: 'generateFocusAreas',
      model: "gpt-4o",
      messages: [systemMessage, userMessage],
      temperature: 0.5
    };
  }

  private isValidFocusAreas(focusAreas: any): boolean {
    if (!Array.isArray(focusAreas)) {
      console.error('Focus areas is not an array:', focusAreas);
      return false;
    }

    if (focusAreas.length === 0) {
      console.error('Focus areas array is empty');
      return false;
    }

    return focusAreas.every(area => {
      const isValid = (
        typeof area.id === 'string' &&
        typeof area.name === 'string' &&
        typeof area.description === 'string' &&
        typeof area.matchLevel === 'number' &&
        area.matchLevel >= 80 &&
        area.matchLevel <= 100 &&
        typeof area.icon === 'string' &&
        typeof area.rationale === 'string' &&
        Array.isArray(area.improvementStrategies) &&
        area.improvementStrategies.every((strategy: any) => typeof strategy === 'string') &&
        Array.isArray(area.recommendedChallengeTypes) &&
        area.recommendedChallengeTypes.every((type: any) => typeof type === 'string')
      );

      if (!isValid) {
        console.error('Invalid focus area structure:', area);
      }

      return isValid;
    });
  }
}
