import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TraitsService } from './traits.service';
import { AttitudesService } from './attitudes.service';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export interface FocusArea {
  id: string;
  name: string;
  description: string;
  matchLevel: number;
  icon: string;
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
  private readonly TIMEOUT_MS = 30000; // 30 seconds timeout

  constructor(
    private http: HttpClient,
    private traitsService: TraitsService,
    private attitudesService: AttitudesService,
    private userService: UserService
  ) { }

  async generateFocusAreas(): Promise<FocusArea[]> {
    const userId = this.userService.getCurrentUserId();
    if (!userId) throw new Error('No user ID found');

    // Get user's traits, attitudes, and details
    const traits = await this.traitsService.getTraits(userId);
    const attitudes = await this.attitudesService.getAttitudes(userId);
    const user = await this.userService.getUser(userId);
    if (!user) throw new Error('User not found');

    // Create a structured request for the cloud function
    const request = this.createStructuredRequest(user, traits, attitudes);

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

      let focusAreas: FocusArea[];
      try {
        focusAreas = JSON.parse(cleanedContent);
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

  private createStructuredRequest(user: User, traits: any, attitudes: any): any {
    // Create a summary of the user's traits and attitudes
    const traitsSummary = this.summarizeTraitsAndAttitudes(traits, attitudes);

    // Create the system message
    const systemMessage = {
      role: 'system',
      content: `You are an AI that generates personalized focus areas for AI challenges.

      IMPORTANT INSTRUCTIONS:
      1. Generate six personalized focus areas for AI challenges based on the user's traits and attitudes.
      2. Use the following information about the user to personalize the focus areas:
         - User Profile: ${JSON.stringify({
        name: user.name,
        professionalTitle: user.professionalTitle,
        location: user.location
      })}
         - Traits Summary: ${traitsSummary}
      3. Each focus area should:
         - Align with the user's strengths, interests, and professional background
         - Present a unique challenge that tests different aspects of human-AI interaction
         - Have a clear description of what the challenge entails
         - Include a match level (80-100) indicating how well it aligns with the user's profile
         - Include an appropriate emoji icon that represents the focus area
      4. Your response MUST be a valid JSON array with the following structure:
         [
           {
             "id": "unique-id-1",
             "name": "Focus Area Name",
             "description": "Detailed description of the focus area and how it relates to the user's traits and attitudes",
             "matchLevel": number between 80-100,
             "icon": "emoji-icon"
           },
           {
             "id": "unique-id-2",
             "name": "Focus Area Name",
             "description": "Detailed description of the focus area and how it relates to the user's traits and attitudes",
             "matchLevel": number between 80-100,
             "icon": "emoji-icon"
           },
           {
             "id": "unique-id-3",
             "name": "Focus Area Name",
             "description": "Detailed description of the focus area and how it relates to the user's traits and attitudes",
             "matchLevel": number between 80-100,
             "icon": "emoji-icon"
           },
           {
             "id": "unique-id-4",
             "name": "Focus Area Name",
             "description": "Detailed description of the focus area and how it relates to the user's traits and attitudes",
             "matchLevel": number between 80-100,
             "icon": "emoji-icon"
           },
           {
             "id": "unique-id-5",
             "name": "Focus Area Name",
             "description": "Detailed description of the focus area and how it relates to the user's traits and attitudes",
             "matchLevel": number between 80-100,
             "icon": "emoji-icon"
           },
           {
             "id": "unique-id-6",
             "name": "Focus Area Name",
             "description": "Detailed description of the focus area and how it relates to the user's traits and attitudes",
             "matchLevel": number between 80-100,
             "icon": "emoji-icon"
           }
         ]
      5. Ensure each focus area is unique and challenging.
      6. The match level should reflect how well the focus area aligns with the user's profile.
      7. DO NOT include any markdown formatting or code blocks in your response.
      8. Your response must be a valid JSON array that can be parsed directly.`

    };

    // Create the user message
    const userMessage = {
      role: 'user',
      content: 'Generate personalized focus areas for AI challenges.'
    };

    // Return the complete request
    return {
      type: 'generateFocusAreas',
      model: "gpt-4",
      messages: [systemMessage, userMessage],
      temperature: 0.7
    };
  }

  private summarizeTraitsAndAttitudes(traits: any, attitudes: any): string {
    if (!traits || !attitudes) {
      return "No traits or attitudes data available.";
    }

    // Summarize traits
    let traitsSummary = "Traits: ";
    if (traits.answers && traits.answers.length > 0) {
      const traitScores = traits.answers.map((answer: any) => {
        const question = traits.questions.find((q: any) => q.id === answer.questionId);
        return `${question ? question.text : 'Unknown trait'}: ${answer.answer}/5`;
      });
      traitsSummary += traitScores.join(', ');
    } else {
      traitsSummary += "No trait answers available.";
    }

    // Summarize attitudes
    let attitudesSummary = "Attitudes: ";
    if (attitudes.answers && attitudes.answers.length > 0) {
      const attitudeScores = attitudes.answers.map((answer: any) => {
        const question = attitudes.questions.find((q: any) => q.id === answer.questionId);
        return `${question ? question.text : 'Unknown attitude'}: ${answer.answer}/5`;
      });
      attitudesSummary += attitudeScores.join(', ');
    } else {
      attitudesSummary += "No attitude answers available.";
    }

    return `${traitsSummary}. ${attitudesSummary}`;
  }

  private isValidFocusAreas(focusAreas: any): boolean {
    if (!Array.isArray(focusAreas) || focusAreas.length !== 6) {
      return false;
    }

    return focusAreas.every(area => {
      return (
        typeof area.id === 'string' &&
        typeof area.name === 'string' &&
        typeof area.description === 'string' &&
        typeof area.matchLevel === 'number' &&
        area.matchLevel >= 80 &&
        area.matchLevel <= 100 &&
        typeof area.icon === 'string'
      );
    });
  }
}
