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

// New interfaces for evaluation prompt building
interface CategoryWeights {
  [key: string]: number;
}

interface EvaluationHistory {
  previousScore?: number;
  previousCategoryScores?: { [key: string]: number; };
  consistentStrengths?: string[];
  persistentWeaknesses?: string[];
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
    // Get user traits and attitudes
    const userProfile = await this.userService.getUser(request.userId);

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Create a structured request for the cloud function
    const structuredRequest = this.buildEvaluationPrompt(request, userProfile);

    // Call the cloud function with retry logic and timeout
    const evaluationResponse = await this.callCloudFunctionWithRetry(structuredRequest);

    // Validate the response structure
    if (!this.isValidEvaluationResponse(evaluationResponse)) {
      throw new Error('Invalid evaluation response structure');
    }

    // Ensure badges are assigned based on metrics
    evaluationResponse.badges = this.assignBadges(evaluationResponse.metrics);

    return evaluationResponse;
  }

  private buildEvaluationPrompt(request: EvaluationRequest, userProfile: any): any {
    const categoryWeights = this.getCategoryWeights(request);
    const evaluationHistory = this.getEvaluationHistory(request.userId);

    const promptSections = [
      this.buildHeaderSection(),
      this.buildChallengeSection(request),
      this.buildUserContextSection(userProfile),
      this.buildEvaluationHistorySection(evaluationHistory),
      this.buildUserResponseSection(request.userResponse),
      this.buildCriteriaSection(categoryWeights),
      this.buildStrengthAnalysisSection(),
      this.buildImprovementPlanSection(),
      this.buildGrowthTrackingSection(evaluationHistory),
      this.buildRecommendationsSection(),
      this.buildResponseFormatSection(categoryWeights)
    ];

    const prompt = promptSections.filter(Boolean).join('\n\n');
    const systemMessage = this.buildDynamicSystemMessage(request, userProfile);

    return {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    };
  }

  private buildHeaderSection(): string {
    return `### EVALUATION TASK\n\nEvaluate the user's response to the challenge with detailed scoring in multiple categories, personalized feedback, and growth tracking.`;
  }

  private buildChallengeSection(request: EvaluationRequest): string {
    const section = ['### CHALLENGE INFORMATION'];
    section.push(`Question: ${request.question}`);
    section.push(`Round Number: ${request.roundNumber}`);
    section.push(`AI Response: ${request.aiResponse}`);
    return section.join('\n');
  }

  private buildUserContextSection(user: any): string {
    if (!user || Object.keys(user).length === 0) {
      return '';
    }
    const section = ['### USER CONTEXT'];
    if (user.name) section.push(`Name: ${user.name}`);
    if (user.email) section.push(`User ID: ${user.email}`);
    if (user.skillLevel) section.push(`Skill Level: ${user.skillLevel}`);
    if (user.focusAreas?.length > 0) {
      section.push(`Focus Areas: ${user.focusAreas.join(', ')}`);
    }
    return section.join('\n');
  }

  private buildEvaluationHistorySection(history: EvaluationHistory): string {
    if (!history || Object.keys(history).length === 0) {
      return '';
    }
    const section = ['### PREVIOUS EVALUATION DATA'];
    if (history.previousScore !== undefined) {
      section.push(`Previous Overall Score: ${history.previousScore}`);
    }
    if (history.previousCategoryScores) {
      section.push('Previous Category Scores:');
      Object.entries(history.previousCategoryScores).forEach(([category, score]) => {
        section.push(`- ${category}: ${score}`);
      });
    }
    if (history.consistentStrengths && history.consistentStrengths.length > 0) {
      section.push(`Consistent Strengths: ${history.consistentStrengths.join(', ')}`);
    }
    if (history.persistentWeaknesses && history.persistentWeaknesses.length > 0) {
      section.push(`Areas Needing Improvement: ${history.persistentWeaknesses.join(', ')}`);
    }
    return section.join('\n');
  }

  private buildUserResponseSection(response: string): string {
    return `### USER RESPONSE\n${response}`;
  }

  private buildCriteriaSection(weights: CategoryWeights): string {
    const section = ['### EVALUATION CRITERIA', 'Evaluate the response using the following criteria:'];
    Object.entries(weights).forEach(([category, weight]) => {
      const description = this.getCategoryDescription(category);
      section.push(`- ${category} (0-${weight} points): ${description}`);
    });
    section.push(`\nThe total maximum score is 100 points.`);
    return section.join('\n');
  }

  private buildStrengthAnalysisSection(): string {
    return `### STRENGTH ANALYSIS
For each strength identified, provide a detailed analysis including:
1. What the user did well (the strength itself)
2. Why this aspect is effective or important
3. How it specifically contributes to the quality of the response`;
  }

  private buildImprovementPlanSection(): string {
    return `### IMPROVEMENT PLANS
For each area needing improvement, provide a detailed plan including:
1. Specific issue to address
2. Why improving this area is important
3. Actionable steps to improve
4. Resources or exercises that could help`;
  }

  private buildGrowthTrackingSection(history: EvaluationHistory): string {
    if (!history || Object.keys(history).length === 0) {
      return '';
    }
    return `### GROWTH TRACKING
Compare the current response to previous evaluations:
1. Identify improvements since the last evaluation
2. Note any persistent strengths or weaknesses
3. Provide specific growth insights`;
  }

  private buildRecommendationsSection(): string {
    return `### PERSONALIZED RECOMMENDATIONS
Based on the user's context, provide:
1. Personalized next steps tailored to their focus areas and skill level
2. 2-3 specific resources that would help improvement (articles, books, courses, etc.)
3. 1-2 recommended challenge types that would build on current strengths or address weaknesses`;
  }

  private buildResponseFormatSection(weights: CategoryWeights): string {
    return `### RESPONSE FORMAT
Provide your evaluation as a JSON object with the following EXACT structure:

{
  "metrics": {
    "accuracy": 0,
    "clarity": 0,
    "reasoning": 0,
    "creativity": 0
  },
  "overallScore": 0,  // REQUIRED: Calculate as average of all metrics (accuracy + clarity + reasoning + creativity) / 4
  "overallFeedback": "Overall feedback about the response",
  "strengths": [],
  "strengthAnalysis": [],
  "areasForImprovement": ["List of areas for improvement"],
  "improvementPlans": [
    {
      "area": "Area for improvement",
      "importance": "Why this is important",
      "actionItems": ["Specific actions"],
      "resources": ["Suggested resources"]
    }
  ],
  "growthInsights": {
    "improvements": [],
    "persistentStrengths": [],
    "developmentAreas": ["Areas needing development"],
    "growthSummary": "Summary of growth"
  },
  "recommendations": {
    "nextSteps": "Next steps for improvement",
    "resources": [
      {
        "title": "Resource title",
        "type": "article|video|course",
        "url": "Resource URL",
        "relevance": "Why this is relevant"
      }
    ],
    "recommendedChallenges": [
      {
        "title": "Challenge title",
        "description": "Challenge description",
        "relevance": "Why this would help"
      }
    ]
  }
}

IMPORTANT:
1. All metrics must be numbers between 0 and 100
2. overallScore is REQUIRED and must be calculated as the average of all metrics
3. All sections must be included exactly as shown
4. Arrays can be empty but must be present
5. Do not include any additional fields or sections
6. Do not use markdown formatting in the response`;
  }

  private buildDynamicSystemMessage(request: EvaluationRequest, user: any): string {
    const messageParts = [];
    messageParts.push(`You are an AI evaluation expert providing `);
    messageParts.push(`${user.preferences?.feedbackStyle || 'constructive'} feedback `);
    messageParts.push(`on ${request.challengeId} challenges. `);

    if (user.skillLevel) {
      const skillLevel = user.skillLevel.toLowerCase();
      if (skillLevel === 'beginner') {
        messageParts.push(`Explain concepts simply and thoroughly, avoiding jargon. `);
      } else if (skillLevel === 'intermediate') {
        messageParts.push(`Balance explanations with appropriate complexity for someone with moderate familiarity. `);
      } else if (skillLevel === 'expert' || skillLevel === 'advanced') {
        messageParts.push(`Provide nuanced, in-depth analysis that acknowledges complexity and edge cases. `);
      }
    }

    if (user.personalityProfile) {
      if (user.personalityProfile.communicationStyle === 'formal') {
        messageParts.push(`Maintain a formal, professional tone. `);
      } else if (user.personalityProfile.communicationStyle === 'casual') {
        messageParts.push(`Use a friendly, conversational tone. `);
      } else if (user.personalityProfile.communicationStyle === 'technical') {
        messageParts.push(`Use precise, technical language where appropriate. `);
      } else {
        messageParts.push(`Use a clear, encouraging tone. `);
      }
    }

    messageParts.push(`Your evaluation should be thorough, fair, and aimed at helping the user improve. `);
    messageParts.push(`Always provide specific examples from their response to illustrate your points. `);
    messageParts.push(`Balance critique with encouragement to maintain motivation.`);
    messageParts.push(`\n\nYour response MUST follow the exact JSON structure specified in the prompt. `);
    messageParts.push(`Ensure all required fields are included and properly formatted.`);

    return messageParts.join('');
  }

  private getCategoryWeights(request: EvaluationRequest): CategoryWeights {
    // Default weights for general challenges
    const defaultWeights = {
      accuracy: 35,
      clarity: 25,
      reasoning: 25,
      creativity: 15
    };

    // Customize weights based on challenge type and focus area
    // This is a simplified version - you can expand this based on your needs
    return defaultWeights;
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      accuracy: 'Evaluate factual correctness, depth of knowledge, and absence of misconceptions',
      clarity: 'Assess organization, clarity of expression, and logical flow of ideas',
      reasoning: 'Evaluate logical connections, critical thinking, and soundness of arguments',
      creativity: 'Judge originality of ideas, innovative thinking, and novel approaches',
      critical_thinking: 'Assess depth of analysis, consideration of alternatives, and avoidance of cognitive biases',
      insight: 'Evaluate the presence of meaningful, non-obvious observations and connections',
      problem_solving: 'Judge the effectiveness of solutions, considering constraints and trade-offs',
      application: 'Assess how well concepts are applied to specific situations or problems',
      communication: 'Evaluate clarity, precision, and effectiveness of communication',
      thoroughness: 'Judge comprehensiveness of research, addressing all relevant aspects',
      methodology: 'Evaluate appropriateness and rigor of methods used',
      critical_analysis: 'Assess ability to evaluate sources, identify biases, and synthesize information',
      presentation: 'Judge organization, clarity, and effective use of evidence',
      originality: 'Evaluate uniqueness and novelty of ideas and approach',
      effectiveness: 'Assess how well the response achieves its intended purpose',
      elaboration: 'Evaluate depth, detail, and development of ideas',
      relevance: 'Judge how well the response addresses the challenge requirements',
      technical_accuracy: 'Evaluate technical correctness and precision',
      implementation: 'Assess the quality and effectiveness of implementation details',
      explanation: 'Evaluate clarity and completeness of explanations for technical choices',
      best_practices: 'Judge adherence to established standards and best practices',
      ethical_reasoning: 'Evaluate depth and nuance of ethical analysis and reasoning',
      comprehensiveness: 'Assess coverage of relevant ethical dimensions and perspectives',
      practical_application: 'Judge how well ethical principles are applied to concrete situations',
      conceptual_understanding: 'Evaluate understanding of core AI concepts and principles',
      critical_perspective: 'Assess ability to critically evaluate AI technologies and claims',
      impact_analysis: 'Evaluate depth and breadth of impact analysis across domains',
      stakeholder_consideration: 'Assess identification and consideration of affected stakeholders',
      systemic_thinking: 'Evaluate understanding of complex systemic interactions and dynamics'
    };

    return descriptions[category.toLowerCase()] || 'Evaluate this aspect of the response';
  }

  private getEvaluationHistory(userId: string): EvaluationHistory {
    // This is a placeholder - implement actual history retrieval logic
    return {};
  }

  private isValidEvaluationResponse(response: any): boolean {
    if (!response) return false;

    // Check if all required properties exist
    if (!response.metrics ||
      !response.overallScore ||
      !response.overallFeedback ||
      !response.areasForImprovement ||
      !response.improvementPlans ||
      !response.growthInsights ||
      !response.recommendations) {
      console.error('Missing required properties:', {
        metrics: !!response.metrics,
        overallScore: !!response.overallScore,
        overallFeedback: !!response.overallFeedback,
        areasForImprovement: !!response.areasForImprovement,
        improvementPlans: !!response.improvementPlans,
        growthInsights: !!response.growthInsights,
        recommendations: !!response.recommendations
      });
      return true;
    }

    // Check metrics structure
    if (typeof response.metrics.accuracy !== 'number' ||
      typeof response.metrics.clarity !== 'number' ||
      typeof response.metrics.reasoning !== 'number' ||
      typeof response.metrics.creativity !== 'number') {
      console.error('Invalid metrics structure:', response.metrics);
      return false;
    }

    // Check if arrays are actually arrays
    if (!Array.isArray(response.areasForImprovement) ||
      !Array.isArray(response.improvementPlans)) {
      console.error('Invalid array structure:', {
        areasForImprovement: Array.isArray(response.areasForImprovement),
        improvementPlans: Array.isArray(response.improvementPlans)
      });
      return false;
    }

    // Check growthInsights structure
    if (!response.growthInsights.improvements ||
      !response.growthInsights.persistentStrengths ||
      !response.growthInsights.developmentAreas ||
      !response.growthInsights.growthSummary) {
      console.error('Invalid growthInsights structure:', response.growthInsights);
      return false;
    }

    // Check recommendations structure
    if (!response.recommendations.nextSteps ||
      !response.recommendations.resources ||
      !response.recommendations.recommendedChallenges) {
      console.error('Invalid recommendations structure:', response.recommendations);
      return false;
    }

    return true;
  }

  private transformResponse(response: any): EvaluationResponse {
    try {
      // Calculate overall score from metrics
      const overallScore = response.overallScore || Math.round(
        (response.metrics.accuracy +
          response.metrics.clarity +
          response.metrics.reasoning +
          response.metrics.creativity) / 4
      );

      // Transform to match our interface
      return {
        metrics: {
          creativity: response.metrics.creativity,
          practicality: response.metrics.accuracy, // Map accuracy to practicality
          depth: response.metrics.reasoning, // Map reasoning to depth
          humanEdge: response.metrics.clarity, // Map clarity to humanEdge
          overall: overallScore
        },
        feedback: [response.overallFeedback],
        strengths: response.strengths || [], // Handle case where strengths might be undefined
        improvements: response.areasForImprovement,
        comparison: {
          userScore: overallScore,
          rivalScore: 50, // Default rival score
          advantage: overallScore > 50 ? 'user' : 'rival',
          advantageReason: overallScore > 50 ?
            'Your response shows good understanding and effort' :
            'There is room for improvement in your response'
        },
        badges: this.assignBadges({
          creativity: response.metrics.creativity,
          practicality: response.metrics.accuracy,
          depth: response.metrics.reasoning,
          humanEdge: response.metrics.clarity,
          overall: overallScore
        })
      };
    } catch (error) {
      console.error('Error transforming response:', error);
      throw new Error('Failed to transform evaluation response: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private async callCloudFunctionWithRetry(request: any): Promise<EvaluationResponse> {
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount < this.MAX_RETRIES) {
      try {
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

        const content = response.data.choices[0].message.content;
        console.log('Raw response content:', content);

        // Remove markdown code block syntax if present
        const cleanContent = content.replace(/```json\n|\n```/g, '').trim();
        console.log('Cleaned content:', cleanContent);

        // Try to parse the JSON
        let evaluationResponse: any;
        try {
          evaluationResponse = JSON.parse(cleanContent);
          console.log('Parsed response:', evaluationResponse);
        } catch (parseError: unknown) {
          console.error('JSON parse error:', parseError);
          console.error('Content that failed to parse:', cleanContent);
          throw new Error('Failed to parse JSON response: ' + (parseError instanceof Error ? parseError.message : String(parseError)));
        }

        // Transform the response to match our interface
        return this.transformResponse(evaluationResponse);
      } catch (error) {
        lastError = error;
        retryCount++;

        if (retryCount < this.MAX_RETRIES) {
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${waitTime}ms... (Attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError || new Error('Failed to get a valid evaluation response after multiple attempts');
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
}
