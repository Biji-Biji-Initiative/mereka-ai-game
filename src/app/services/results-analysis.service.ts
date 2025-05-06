import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError, from } from 'rxjs';
import { catchError, delay, retry, timeout, map, switchMap } from 'rxjs/operators';
import { RoundEvaluationService, EvaluationResponse } from './round-evaluation.service';
import { Firestore, collection, doc, getDoc, getDocs, query, where, setDoc } from '@angular/fire/firestore';
import { Challenge, FocusData } from './challenge.service';

// Final Results interface matching the structure used in the results component
export interface FinalResults {
  overallScore: number;
  focusArea: {
    name: string;
    description: string;
  };
  rounds: {
    [key: string]: {
      score: number;
      strengths: string[];
      areas: string[];
      comparison: {
        humanScore: number;
        aiScore: number;
        difference: number;
      };
    };
  };
  badges: {
    name: string;
    icon: string;
    description: string;
  }[];
  insights: string[];
  recommendations: string[];
  traits?: string[];
  attitudes?: string[];
  focus?: FocusData;
}

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
      };
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
export class ResultsAnalysisService {
  private readonly CLOUD_FUNCTION_URL = `${environment.apiUrl}/processRequest`;
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 50000; // 30 seconds timeout
  private readonly RESULTS_COLLECTION = 'final_results';

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private roundEvaluationService: RoundEvaluationService
  ) { }

  analyzeResults(challengeId: string, userId: string): Observable<FinalResults> {
    console.log('analyzeResults called with challengeId:', challengeId);

    // First check if we already have a cached result
    return from(this.getCachedResults(userId, challengeId)).pipe(
      switchMap(cachedResult => {
        if (cachedResult) {
          console.log('Using cached results:', cachedResult);
          return of(cachedResult);
        }

        console.log('No cached results found, fetching round evaluations');
        // If no cached result, fetch all round evaluations and generate a new analysis
        return from(this.fetchRoundEvaluations(userId, challengeId)).pipe(
          switchMap(evaluations => {
            console.log('Fetched round evaluations:', evaluations);
            if (!evaluations || evaluations.length === 0) {
              throw new Error('No round evaluations found to analyze');
            }
            return from(this.generateFinalReport(userId, challengeId, evaluations));
          })
        );
      })
    );
  }

  private async getCachedResults(userId: string, challengeId: string): Promise<FinalResults | null> {
    try {
      const resultsRef = collection(this.firestore, this.RESULTS_COLLECTION);
      const q = query(resultsRef,
        where('userId', '==', userId),
        where('challengeId', '==', challengeId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data() as FinalResults;
      }

      return null;
    } catch (error) {
      console.error('Error fetching cached results:', error);
      return null;
    }
  }

  private async fetchRoundEvaluations(userId: string, challengeId: string): Promise<EvaluationResponse[]> {
    try {
      // Get the challenge document which contains the evaluation data
      const challengeRef = doc(this.firestore, `challenges/${challengeId}`);
      const challengeDoc = await getDoc(challengeRef);

      if (!challengeDoc.exists()) {
        console.warn('Challenge document not found');
        return [this.createDefaultEvaluation(userId, challengeId, 1)];
      }

      const challengeData = challengeDoc.data() as Challenge;
      const rounds = challengeData.rounds || [];

      // Map each round's evaluation data to EvaluationResponse
      const evaluations: EvaluationResponse[] = rounds.map(round => {
        const evaluation = round.evaluation || {};
        return {
          metrics: {
            creativity: evaluation['creativity'] || 5,
            practicality: evaluation['practicality'] || 5,
            depth: evaluation['depth'] || 5,
            humanEdge: evaluation['humanEdge'] || 5,
            overall: evaluation['overall'] || 5
          },
          feedback: Array.isArray(evaluation['feedback']) ? evaluation['feedback'] : [],
          strengths: Array.isArray(evaluation['strengths']) ? evaluation['strengths'] : [],
          improvements: Array.isArray(evaluation['improvements']) ? evaluation['improvements'] : [],
          comparison: {
            userScore: evaluation['userScore'] || 5,
            rivalScore: evaluation['rivalScore'] || 10,
            advantage: evaluation['advantage'] || 'rival',
            advantageReason: evaluation['advantageReason'] || ''
          },
          badges: Array.isArray(evaluation['badges']) ? evaluation['badges'] : ['Participant']
        };
      });

      // If no evaluations found, return default ones
      if (evaluations.length === 0) {
        return [
          this.createDefaultEvaluation(userId, challengeId, 1),
          this.createDefaultEvaluation(userId, challengeId, 2),
          this.createDefaultEvaluation(userId, challengeId, 3)
        ];
      }

      return evaluations;
    } catch (error) {
      console.error('Error fetching challenge evaluation:', error);
      return [
        this.createDefaultEvaluation(userId, challengeId, 1),
        this.createDefaultEvaluation(userId, challengeId, 2),
        this.createDefaultEvaluation(userId, challengeId, 3)
      ];
    }
  }

  private async generateFinalReport(
    userId: string,
    challengeId: string,
    evaluations: EvaluationResponse[]
  ): Promise<FinalResults> {
    try {
      // Get the challenge data to include focus area
      const challengeRef = doc(this.firestore, `challenges/${challengeId}`);
      const challengeDoc = await getDoc(challengeRef);
      const challengeData = challengeDoc.exists() ? (challengeDoc.data() as Challenge) : null;

      // Get user traits and attitudes
      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : null;

      // Create a structured request for the cloud function
      const request = this.createAnalysisRequest(userId, challengeId, evaluations, challengeData, userData);
      console.log('Request to cloud function:', JSON.stringify(request, null, 2));

      // Call the cloud function with retry logic and timeout
      const response = await this.callCloudFunctionWithRetry(request);
      console.log('Response from cloud function:', JSON.stringify(response, null, 2));

      // Parse the response and add additional data
      console.log('Response content to parse:', response.data.choices[0].message.content);

      let finalResults: FinalResults;
      try {
        // Clean the response content by removing markdown formatting
        const cleanedContent = response.data.choices[0].message.content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        // Try to parse the cleaned response as JSON
        finalResults = JSON.parse(cleanedContent) as FinalResults;
        console.log('Parsed final results:', JSON.stringify(finalResults, null, 2));

        // Round the overallScore to 2 decimal places
        if (typeof finalResults.overallScore === 'number') {
          finalResults.overallScore = Number(finalResults.overallScore.toFixed(2));
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw content that failed to parse:', response.data.choices[0].message.content);
        throw new Error('Failed to parse AI analysis response');
      }

      // Ensure the structure matches what the HTML template expects
      finalResults = this.ensureValidResultsStructure(finalResults, evaluations);

      // Add focus area from challenge if available
      if (challengeData?.focus) {
        finalResults.focus = challengeData.focus;
      }

      // Add traits and attitudes from user data if available
      if (userData) {
        finalResults.traits = userData['traits'] || [];
        finalResults.attitudes = userData['attitudes'] || [];
      }

      // Cache the results in Firestore
      await this.cacheResults(userId, challengeId, finalResults);

      return finalResults;
    } catch (error) {
      console.error('Error generating final report:', error);
      throw error; // Re-throw the error instead of returning default results
    }
  }

  private async callCloudFunctionWithRetry(request: any): Promise<CloudFunctionResponse> {
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount < this.MAX_RETRIES) {
      try {
        console.log(`Attempt ${retryCount + 1} to call cloud function`);
        console.log('Cloud function URL:', this.CLOUD_FUNCTION_URL);

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

        console.log('Raw response from cloud function:', response);

        if (!response || !response.success) {
          console.error('Invalid response from cloud function:', response);
          throw new Error('No valid response from analysis service');
        }

        return response;
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
    throw lastError || new Error('Failed to get a valid analysis response after multiple attempts');
  }

  private createAnalysisRequest(
    userId: string,
    challengeId: string,
    evaluations: EvaluationResponse[],
    challengeData: Challenge | null,
    userData: any
  ): any {
    const systemMessage = {
      role: 'system',
      content: `You are an AI analyst that evaluates a user's performance across multiple rounds of a challenge.
      Focus on analyzing the following aspects:
      1. Overall performance and progression across rounds
      2. Strengths and areas for improvement
      3. Comparison with AI responses
      4. Integration with user's traits and attitudes
      5. Alignment with challenge focus area

      Your response MUST be valid JSON matching the following structure EXACTLY:
      {
        "overallScore": number,
        "focusArea": {
          "name": string,
          "description": string
        },
        "rounds": {
          "round1": {
            "score": number,
            "strengths": string[],
            "areas": string[],
            "comparison": {
              "humanScore": number,
              "aiScore": number,
              "difference": number
            }
          },
          "round2": { ... same structure as round1 ... },
          "round3": { ... same structure as round1 ... }
        },
        "badges": [
          {
            "name": string,
            "icon": string,
            "description": string
          }
        ],
        "insights": string[],
        "recommendations": string[]
      }

      Do not include any text outside of this JSON structure.`
    };

    const userMessage = {
      role: 'user',
      content: `Analyze the following data:
      User ID: ${userId}
      Challenge ID: ${challengeId}
      Challenge Data: ${JSON.stringify(challengeData)}
      User Data: ${JSON.stringify(userData)}
      Evaluations: ${JSON.stringify(evaluations)}`
    };

    return {
      model: "gpt-4o",
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 10000
    };
  }

  private async cacheResults(
    userId: string,
    challengeId: string,
    results: FinalResults
  ): Promise<void> {
    try {
      // Create a document ID that combines userId and challengeId
      const docId = `${userId}_${challengeId}`;

      // Add metadata to the results
      const resultsWithMetadata = {
        ...results,
        userId,
        challengeId,
        timestamp: new Date().toISOString()
      };

      // Store in Firestore
      await setDoc(doc(this.firestore, this.RESULTS_COLLECTION, docId), resultsWithMetadata);
    } catch (error) {
      console.error('Error caching results:', error);
    }
  }

  private createDefaultEvaluation(
    userId: string,
    challengeId: string,
    roundNumber: number
  ): EvaluationResponse {
    return {
      metrics: {
        creativity: 50,
        practicality: 50,
        depth: 50,
        humanEdge: 50,
        overall: 50
      },
      feedback: [
        'No evaluation data available for this round.',
        'Your response has been recorded, but we couldn\'t generate a detailed evaluation at this time.'
      ],
      strengths: ['Your participation is appreciated.'],
      improvements: [
        'Try providing more detailed responses in the future.',
        'Consider expanding on your thoughts with specific examples.'
      ],
      comparison: {
        userScore: 50,
        rivalScore: 50,
        advantage: 'tie',
        advantageReason: 'Evaluation could not be completed at this time.'
      },
      badges: ['Participant']
    };
  }

  // New method to ensure the results structure is valid
  private ensureValidResultsStructure(results: FinalResults, evaluations: EvaluationResponse[]): FinalResults {
    // Ensure overallScore is a number
    if (typeof results.overallScore !== 'number') {
      results.overallScore = 50; // Default score
    }

    // Ensure focusArea exists with name and description
    if (!results.focusArea || typeof results.focusArea !== 'object') {
      results.focusArea = {
        name: 'General Improvement',
        description: 'Focus on developing a balanced approach to all aspects of your responses.'
      };
    } else {
      if (typeof results.focusArea.name !== 'string') {
        results.focusArea.name = 'General Improvement';
      }
      if (typeof results.focusArea.description !== 'string') {
        results.focusArea.description = 'Focus on developing a balanced approach to all aspects of your responses.';
      }
    }

    // Ensure rounds exist and have the correct structure
    if (!results.rounds || typeof results.rounds !== 'object') {
      results.rounds = {};
    }

    // Process each round
    evaluations.forEach((evaluation, index) => {
      const roundKey = `round${index + 1}`;

      // Ensure the round exists
      if (!results.rounds[roundKey]) {
        results.rounds[roundKey] = {
          score: evaluation.metrics.overall,
          strengths: evaluation.strengths || [],
          areas: evaluation.improvements || [],
          comparison: {
            humanScore: evaluation.comparison.userScore,
            aiScore: evaluation.comparison.rivalScore,
            difference: evaluation.comparison.userScore - evaluation.comparison.rivalScore
          }
        };
      } else {
        // Ensure score is a number
        if (typeof results.rounds[roundKey].score !== 'number') {
          results.rounds[roundKey].score = evaluation.metrics.overall;
        }

        // Ensure strengths is an array
        if (!Array.isArray(results.rounds[roundKey].strengths)) {
          results.rounds[roundKey].strengths = evaluation.strengths || [];
        }

        // Ensure areas is an array
        if (!Array.isArray(results.rounds[roundKey].areas)) {
          results.rounds[roundKey].areas = evaluation.improvements || [];
        }

        // Ensure comparison exists with the correct structure
        if (!results.rounds[roundKey].comparison || typeof results.rounds[roundKey].comparison !== 'object') {
          results.rounds[roundKey].comparison = {
            humanScore: evaluation.comparison.userScore,
            aiScore: evaluation.comparison.rivalScore,
            difference: evaluation.comparison.userScore - evaluation.comparison.rivalScore
          };
        } else {
          // Ensure humanScore is a number
          if (typeof results.rounds[roundKey].comparison.humanScore !== 'number') {
            results.rounds[roundKey].comparison.humanScore = evaluation.comparison.userScore;
          }

          // Ensure aiScore is a number
          if (typeof results.rounds[roundKey].comparison.aiScore !== 'number') {
            results.rounds[roundKey].comparison.aiScore = evaluation.comparison.rivalScore;
          }

          // Ensure difference is a number
          if (typeof results.rounds[roundKey].comparison.difference !== 'number') {
            results.rounds[roundKey].comparison.difference =
              results.rounds[roundKey].comparison.humanScore - results.rounds[roundKey].comparison.aiScore;
          }
        }
      }
    });

    // Ensure badges is an array
    if (!Array.isArray(results.badges)) {
      results.badges = [
        {
          name: 'Participant',
          icon: '🏆',
          description: 'You completed the challenge!'
        }
      ];
    } else {
      // Ensure each badge has the correct structure
      results.badges = results.badges.map(badge => {
        if (typeof badge !== 'object') {
          return {
            name: 'Participant',
            icon: '🏆',
            description: 'You completed the challenge!'
          };
        }

        return {
          name: typeof badge.name === 'string' ? badge.name : 'Participant',
          icon: typeof badge.icon === 'string' ? badge.icon : '🏆',
          description: typeof badge.description === 'string' ? badge.description : 'You completed the challenge!'
        };
      });
    }

    // Ensure insights is an array
    if (!Array.isArray(results.insights)) {
      results.insights = [
        'Your performance shows potential for growth.',
        'Consistency across rounds is important for improvement.',
        'Consider the feedback from each round to enhance your approach.'
      ];
    }

    // Ensure recommendations is an array
    if (!Array.isArray(results.recommendations)) {
      results.recommendations = [
        'Practice responding to similar challenges to build your skills.',
        'Take time to reflect on your performance after each round.',
        'Focus on the areas identified for improvement in future challenges.'
      ];
    }

    return results;
  }
}
