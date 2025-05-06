import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';
import { CloudFunctionPayload, exampleCloudFunctionPayload } from '../models/cloud-function-payload.model';
import { RoundResponse } from '../models/cloud-function-response.model';

// Cloud Function response interface
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
      prompt_tokens_details: {
        cached_tokens: number;
        audio_tokens: number;
      };
      completion_tokens_details: {
        reasoning_tokens: number;
        audio_tokens: number;
        accepted_prediction_tokens: number;
        rejected_prediction_tokens: number;
      };
    };
    service_tier: string;
    system_fingerprint: string;
  };
}

// Round generation options interface
interface RoundGenerationOptions {
  // Round types
  roundTypes: string[];

  // Difficulty levels
  difficultyLevels: string[];

  // Context categories
  contextCategories: string[];

  // Focus areas
  focusAreas: string[];

  // Challenge formats
  challengeFormats: string[];

  // Answer types
  answerTypes: string[];
}

export interface RoundGenerationRequest {
  userId: string;
  focusType: string;
  context?: string;
  previousRounds?: {
    question: string;
    answer: string;
    evaluation: any;
  }[];
}

export interface GeneratedRound {
  id: string;
  title: string;
  description: string;
  type: string;
  context: string;
  difficulty: number;
  challenges: GeneratedChallenge[];
  estimatedTime: number; // in minutes
}

export interface GeneratedChallenge {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoundGeneratorService {
  // Cloud Function URL
  private readonly CLOUD_FUNCTION_URL = `${environment.apiUrl}/processRequest`;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  async generateRound(userId: string, focusType: string, context?: string, previousRounds?: any[]): Promise<RoundResponse> {
    try {
      // Fetch user data from the database
      const userProfile = await this.userService.getUser(userId);

      // Prepare the request payload
      const payload: CloudFunctionPayload = {
        userId,
        focusType,
        context: context || `Generate a challenge focused on ${focusType}`,
        traits: exampleCloudFunctionPayload.traits,
        attitudes: exampleCloudFunctionPayload.attitudes,
        userProfile: userProfile || exampleCloudFunctionPayload.userProfile,
        options: exampleCloudFunctionPayload.options,
        previousRounds: previousRounds || []
      };

      // Create the simple request for array of strings
      const simpleRequest = this.createSimpleRequest(payload);

      // Call the Cloud Function with the simple request
      const response = await this.http.post<CloudFunctionResponse>(this.CLOUD_FUNCTION_URL, simpleRequest).toPromise();

      if (!response || !response.success) {
        throw new Error('No valid response from Cloud Function');
      }

      // Extract the array of strings from the content field
      const content = response.data.choices[0].message.content;
      let questions: string[] = [];

      try {
        // Parse the content as JSON
        questions = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing content as JSON:', error);
        // Fallback: try to extract strings from the content
        const matches = content.match(/"([^"]+)"/g);
        if (matches) {
          questions = matches.map(match => match.replace(/"/g, ''));
        } else {
          throw new Error('Could not extract questions from response');
        }
      }

      // Convert the array of strings to a RoundResponse
      return this.convertToRoundResponse(questions, focusType);
    } catch (error) {
      console.error('Error generating round:', error);
      throw error;
    }
  }

  private createSimpleRequest(payload: CloudFunctionPayload): any {
    // Extract focus areas and context categories for the prompt
    const focusAreas = payload.options.focusAreas.join(', ');
    const contextCategories = payload.options.contextCategories.join(', ');
    const roundTypes = payload.options.roundTypes.join(', ');
    const challengeFormats = payload.options.challengeFormats.join(', ');

    // Create a summary of the user's traits and attitudes
    const traitsSummary = this.summarizeTraitsAndAttitudes(payload.traits, payload.attitudes);

    // Create a summary of previous rounds if they exist
    let previousRoundsSummary = '';
    if (payload.previousRounds && payload.previousRounds.length > 0) {
      previousRoundsSummary = '\n\nPrevious Rounds Summary:';
      payload.previousRounds.forEach((round, index) => {
        previousRoundsSummary += `\nRound ${index + 1}:
          - Question: ${round.question}
          - User's Answer: ${round.answer}
          - Evaluation: ${JSON.stringify(round.evaluation)}`;
      });
    }

    // Create the system message
    const systemMessage = {
      role: 'system',
      content: `You are an AI game assistant that generates personalized challenges and questions for users.

      IMPORTANT INSTRUCTIONS:
      1. Generate a round of challenges based on the user's profile, traits, and attitudes.
      2. The round should focus on the specified focus type: ${payload.focusType}.
      3. The context for the challenges should be: ${payload.context}.
      4. Use the following information about the user to personalize the challenges:
         - User Profile: ${JSON.stringify(payload.userProfile)}
         - Traits Summary: ${traitsSummary}
      5. The challenges should be appropriate for the user's level based on their traits and attitudes.
      6. Your response MUST be an array of strings, where each string is a question for a challenge.
      7. Generate 2 questions that progressively increase in difficulty.
      8. Each question should be clear, concise, and focused on the specified focus type.
      9. The questions should be open-ended and encourage thoughtful responses.
      10. Consider the user's previous performance and responses to create more challenging and relevant questions.
      ${previousRoundsSummary}

      Available focus areas: ${focusAreas}
      Available context categories: ${contextCategories}
      Available round types: ${roundTypes}
      Available challenge formats: ${challengeFormats}`
    };

    // Create the user message
    const userMessage = {
      role: 'user',
      content: `Generate a round of challenges for a user with the following focus type: ${payload.focusType}.`
    };

    // Return the complete OpenAI API request
    return {
      model: "gpt-4o",
      messages: [systemMessage, userMessage],
      temperature: 0.4
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

  private convertToRoundResponse(questions: string[], focusType: string): RoundResponse {
    // Generate a unique ID for the round
    const roundId = 'round-' + Date.now();

    // Create challenges from the questions
    const challenges = questions.map((question, index) => ({
      id: `challenge-${index + 1}`,
      question: question,
      type: 'open-ended',
      points: 10 + (index * 5) // Increasing points for each challenge
    }));

    // Create the round response
    return {
      id: roundId,
      title: `${focusType.charAt(0).toUpperCase() + focusType.slice(1)} Challenge`,
      description: `A series of challenges focused on ${focusType}`,
      type: 'scenario',
      context: 'general',
      difficulty: 3,
      challenges: challenges,
      estimatedTime: 20
    };
  }
}
