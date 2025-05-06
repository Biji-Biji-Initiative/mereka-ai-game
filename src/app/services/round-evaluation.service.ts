import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { CloudFunctionPayload, exampleCloudFunctionPayload } from '../models/cloud-function-payload.model';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, retry, timeout } from 'rxjs/operators';

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

// Evaluation request interface
export interface EvaluationRequest {
  userId: string;
  challengeId: string;
  roundNumber: number;
  question: string;
  userResponse: string;
  aiResponse: string;
}

// Evaluation response interface matching the ChallengeResponse.evaluation structure
export interface EvaluationResponse {
  metrics: {
    creativity: number;
    practicality: number;
    depth: number;
    humanEdge: number;
    overall: number;
  };
  feedback: string[];
  strengths: string[];
  improvements: string[];
  comparison: {
    userScore: number;
    rivalScore: number;
    advantage: 'user' | 'rival' | 'tie';
    advantageReason: string;
  };
  badges: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoundEvaluationService {
  private readonly CLOUD_FUNCTION_URL = `${environment.apiUrl}/processRequest`;
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 30000; // 30 seconds timeout

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  async evaluateResponse(request: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      // Get user traits and attitudes
      const userProfile = await this.userService.getUser(request.userId);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Create a structured request for the cloud function
      const simpleRequest = this.createSimpleRequest(request, userProfile);

      // Call the cloud function with retry logic and timeout
      const evaluationResponse = await this.callCloudFunctionWithRetry(simpleRequest);

      // Validate the response structure
      if (!this.isValidEvaluationResponse(evaluationResponse)) {
        throw new Error('Invalid evaluation response structure');
      }

      // Ensure badges are assigned based on metrics
      evaluationResponse.badges = this.assignBadges(evaluationResponse.metrics);

      return evaluationResponse;
    } catch (error) {
      console.error('Error evaluating response:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('User profile not found')) {
          throw new Error('Unable to evaluate response: User profile not found. Please try again.');
        } else if (error.message.includes('Invalid evaluation response structure')) {
          throw new Error('Unable to evaluate response: Invalid evaluation format received. Please try again.');
        } else if (error.message.includes('No valid response from evaluation service')) {
          throw new Error('Unable to evaluate response: Evaluation service is currently unavailable. Please try again later.');
        } else if (error.message.includes('Invalid evaluation response format')) {
          throw new Error('Unable to evaluate response: Invalid response format. Please try again.');
        }
      }

      // For any other errors, throw a generic error
      throw new Error('An unexpected error occurred while evaluating your response. Please try again later.');
    }
  }

  private async callCloudFunctionWithRetry(request: any): Promise<EvaluationResponse> {
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount < this.MAX_RETRIES) {
      try {
        // Use Observable with timeout and retry
        const response = await this.http.post<CloudFunctionResponse>(
          this.CLOUD_FUNCTION_URL,
          request
        )
          .pipe(
            timeout(this.TIMEOUT_MS),
            retry(1),
            catchError(error => {
              console.error(`Attempt ${retryCount + 1} failed:`, error);
              lastError = error;
              return throwError(error);
            })
          )
          .toPromise();

        if (!response || !response.success) {
          throw new Error('No valid response from evaluation service');
        }

        // Extract the evaluation response from the content field
        const content = response.data.choices[0].message.content;
        let evaluationResponse: EvaluationResponse;

        try {
          // Parse the content as JSON
          evaluationResponse = JSON.parse(content);

          // Validate the parsed response
          if (this.isValidEvaluationResponse(evaluationResponse)) {
            // Ensure badges are assigned based on metrics
            evaluationResponse.badges = this.assignBadges(evaluationResponse.metrics);
            return evaluationResponse;
          } else {
            throw new Error('Invalid evaluation response structure');
          }
        } catch (parseError) {
          console.error('Error parsing evaluation response:', parseError);
          throw new Error('Invalid evaluation response format');
        }
      } catch (error) {
        lastError = error;
        retryCount++;

        if (retryCount < this.MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${waitTime}ms... (Attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError || new Error('Failed to get a valid evaluation response after multiple attempts');
  }

  private isValidEvaluationResponse(response: any): boolean {
    if (!response) return false;

    // Check if all required properties exist
    if (!response.metrics ||
      !response.feedback ||
      !response.strengths ||
      !response.improvements ||
      !response.comparison ||
      !response.badges) {
      return false;
    }

    // Check metrics structure
    if (!response.metrics.creativity ||
      !response.metrics.practicality ||
      !response.metrics.depth ||
      !response.metrics.humanEdge ||
      !response.metrics.overall) {
      return false;
    }

    // Check comparison structure
    if (!response.comparison.userScore ||
      !response.comparison.rivalScore ||
      !response.comparison.advantage ||
      !response.comparison.advantageReason) {
      return false;
    }

    // Check if arrays are actually arrays
    if (!Array.isArray(response.feedback) ||
      !Array.isArray(response.strengths) ||
      !Array.isArray(response.improvements) ||
      !Array.isArray(response.badges)) {
      return false;
    }

    // Check if advantage is one of the expected values
    if (!['user', 'rival', 'tie'].includes(response.comparison.advantage)) {
      return false;
    }

    return true;
  }

  private assignBadges(metrics: any): string[] {
    const badges: string[] = [];

    // Always award the Participant badge
    badges.push('Participant');

    // Award badges based on metrics
    if (metrics.overall >= 80) {
      badges.push('Excellence');
    } else if (metrics.overall >= 60) {
      badges.push('Proficiency');
    }

    if (metrics.creativity >= 80) {
      badges.push('Innovator');
    } else if (metrics.creativity >= 60) {
      badges.push('Creative Thinker');
    }

    if (metrics.practicality >= 80) {
      badges.push('Problem Solver');
    } else if (metrics.practicality >= 60) {
      badges.push('Practical Mind');
    }

    if (metrics.depth >= 80) {
      badges.push('Deep Thinker');
    } else if (metrics.depth >= 60) {
      badges.push('Analytical');
    }

    if (metrics.humanEdge >= 80) {
      badges.push('Human Touch');
    } else if (metrics.humanEdge >= 60) {
      badges.push('Empathetic');
    }

    return badges;
  }

  private createSimpleRequest(
    request: EvaluationRequest,
    userProfile: any
  ): any {
    // Create the system message
    const systemMessage = {
      role: 'system',
      content: `You are an AI evaluator that assesses user responses to challenges.

      IMPORTANT INSTRUCTIONS:
      1. Evaluate the user's response based on their profile, traits, and attitudes.
      2. The question being evaluated is: ${request.question}
      3. The user's response is: ${request.userResponse}
      4. The AI's response for comparison is: ${request.aiResponse}
      5. Use the following information about the user to personalize the evaluation:
         - User Profile: ${JSON.stringify(userProfile)}
      6. Your response MUST be a JSON object with the following structure:
         {
           "metrics": {
             "creativity": number (0-100),
             "practicality": number (0-100),
             "depth": number (0-100),
             "humanEdge": number (0-100),
             "overall": number (0-100)
           },
           "feedback": string[],
           "strengths": string[],
           "improvements": string[],
           "comparison": {
             "userScore": number (0-100),
             "rivalScore": number (0-100),
             "advantage": "user" | "rival" | "tie",
             "advantageReason": string
           },
           "badges": string[]
         }
      7. Provide specific, actionable feedback based on the user's response.
      8. Compare the user's response with the AI's response and explain the advantage.
      9. Award badges based on the quality and uniqueness of the response.
      10. ALWAYS include at least one badge in the badges array.`
    };

    // Create the user message
    const userMessage = {
      role: 'user',
      content: `Evaluate the user's response to the question: ${request.question}`
    };

    // Return the complete OpenAI API request
    return {
      model: "gpt-4o",
      messages: [systemMessage, userMessage],
      temperature: 0.4
    };
  }

  private createDefaultEvaluation(request: EvaluationRequest): EvaluationResponse {
    // Create a meaningful default evaluation based on the request
    const responseLength = request.userResponse.length;
    const hasContent = responseLength > 0;

    // Determine a base score based on response length
    let baseScore = 30; // Default low score
    if (responseLength > 100) {
      baseScore = 50;
    } else if (responseLength > 50) {
      baseScore = 40;
    } else if (hasContent) {
      baseScore = 35;
    }

    // Create a consistent evaluation that doesn't use random values
    return {
      metrics: {
        creativity: baseScore,
        practicality: baseScore,
        depth: baseScore,
        humanEdge: baseScore,
        overall: baseScore
      },
      feedback: [
        'We encountered an issue while evaluating your response.',
        'Your response has been recorded, but we couldn\'t generate a detailed evaluation at this time.',
        'Please try again later for a complete evaluation.'
      ],
      strengths: hasContent ? ['Your response was submitted successfully.'] : ['Your participation is appreciated.'],
      improvements: [
        'Try providing more detailed responses in the future.',
        'Consider expanding on your thoughts with specific examples.',
        'Engage more deeply with the questions to get better evaluations.'
      ],
      comparison: {
        userScore: baseScore,
        rivalScore: 50,
        advantage: 'rival',
        advantageReason: 'Evaluation could not be completed at this time.'
      },
      badges: ['Participant']
    };
  }
}
