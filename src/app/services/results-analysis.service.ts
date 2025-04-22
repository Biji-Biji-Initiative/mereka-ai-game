import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError, from } from 'rxjs';
import { catchError, delay, retry, timeout, map, switchMap } from 'rxjs/operators';
import { RoundEvaluationService, EvaluationResponse } from './round-evaluation.service';
import { Firestore, collection, doc, getDoc, getDocs, query, where, setDoc } from '@angular/fire/firestore';

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
  private readonly TIMEOUT_MS = 30000; // 30 seconds timeout
  private readonly RESULTS_COLLECTION = 'final_results';

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private roundEvaluationService: RoundEvaluationService
  ) { }

  analyzeResults(userId: string, challengeId: string): Observable<FinalResults> {
    // First check if we already have a cached result
    return from(this.getCachedResults(userId, challengeId)).pipe(
      switchMap(cachedResult => {
        if (cachedResult) {
          return of(cachedResult);
        }

        // If no cached result, fetch all round evaluations and generate a new analysis
        return from(this.fetchRoundEvaluations(userId, challengeId)).pipe(
          switchMap(evaluations => from(this.generateFinalReport(userId, challengeId, evaluations)))
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
    const evaluations: EvaluationResponse[] = [];

    // Fetch evaluations for rounds 1-3
    for (let roundNumber = 1;roundNumber <= 3;roundNumber++) {
      try {
        // Get the round evaluation from Firestore
        const roundRef = doc(this.firestore, `challenges/${challengeId}/rounds/${roundNumber}/evaluations/${userId}`);
        const roundDoc = await getDoc(roundRef);

        if (roundDoc.exists()) {
          const evaluationData = roundDoc.data() as EvaluationResponse;
          evaluations.push(evaluationData);
        } else {
          console.warn(`No evaluation found for round ${roundNumber}`);
          // Add a default evaluation if none exists
          evaluations.push(this.createDefaultEvaluation(userId, challengeId, roundNumber));
        }
      } catch (error) {
        console.error(`Error fetching evaluation for round ${roundNumber}:`, error);
        // Add a default evaluation on error
        evaluations.push(this.createDefaultEvaluation(userId, challengeId, roundNumber));
      }
    }

    return evaluations;
  }

  private async generateFinalReport(
    userId: string,
    challengeId: string,
    evaluations: EvaluationResponse[]
  ): Promise<FinalResults> {
    try {
      // Create a structured request for the cloud function
      const request = this.createAnalysisRequest(userId, challengeId, evaluations);

      // Call the cloud function with retry logic and timeout
      const response = await this.callCloudFunctionWithRetry(request);

      // Parse the response
      const finalResults = JSON.parse(response.data.choices[0].message.content) as FinalResults;

      // Cache the results in Firestore
      await this.cacheResults(userId, challengeId, finalResults);

      return finalResults;
    } catch (error) {
      console.error('Error generating final report:', error);
      return this.createDefaultFinalResults(evaluations);
    }
  }

  private async callCloudFunctionWithRetry(request: any): Promise<CloudFunctionResponse> {
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
    evaluations: EvaluationResponse[]
  ): any {
    // Create the system message
    const systemMessage = {
      role: 'system',
      content: `You are an AI analyst that evaluates a user's performance across multiple rounds of a challenge.

      IMPORTANT INSTRUCTIONS:
      1. Analyze the user's performance across all rounds based on the provided evaluations.
      2. Your response MUST be a JSON object with the following structure:
         {
           "overallScore": number (0-100),
           "focusArea": {
             "name": string,
             "description": string
           },
           "rounds": {
             "round1": {
               "score": number (0-100),
               "strengths": string[],
               "areas": string[],
               "comparison": {
                 "humanScore": number (0-100),
                 "aiScore": number (0-100),
                 "difference": number
               }
             },
             "round2": { ... same structure as round1 ... },
             "round3": { ... same structure as round1 ... }
           },
           "badges": [
             {
               "name": string,
               "icon": string (emoji),
               "description": string
             }
           ],
           "insights": string[],
           "recommendations": string[]
         }
      3. Calculate the overall score based on the average of all round scores.
      4. Identify a focus area where the user needs the most improvement.
      5. For each round, extract strengths and areas for improvement from the evaluations.
      6. Calculate the comparison between human and AI scores for each round.
      7. Award badges based on the user's performance across all rounds.
      8. Provide 3-5 key insights about the user's performance.
      9. Provide 3-5 actionable recommendations for improvement.`
    };

    // Create the user message with the evaluations
    const userMessage = {
      role: 'user',
      content: `Analyze the following evaluations for a user (${userId}) in challenge (${challengeId}):
        ${JSON.stringify(evaluations, null, 2)}`
    };

    // Return the complete OpenAI API request
    return {
      model: "gpt-4o",
      messages: [systemMessage, userMessage],
      temperature: 0.4
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

  private createDefaultFinalResults(evaluations: EvaluationResponse[]): FinalResults {
    // Calculate average scores from the evaluations
    const scores = evaluations.map(evaluation => evaluation.metrics.overall);
    const avgScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 50;

    // Create a default focus area
    const focusArea = {
      name: 'General Improvement',
      description: 'Focus on developing a balanced approach to all aspects of your responses.'
    };

    // Create default round data
    const rounds: any = {};
    evaluations.forEach((evaluation, index) => {
      const roundKey = `round${index + 1}`;
      rounds[roundKey] = {
        score: evaluation.metrics.overall,
        strengths: evaluation.strengths,
        areas: evaluation.improvements,
        comparison: {
          humanScore: evaluation.comparison.userScore,
          aiScore: evaluation.comparison.rivalScore,
          difference: evaluation.comparison.userScore - evaluation.comparison.rivalScore
        }
      };
    });

    // Create default badges
    const badges = [
      {
        name: 'Participant',
        icon: '🏆',
        description: 'You completed the challenge!'
      }
    ];

    // Add more badges based on performance
    if (avgScore >= 80) {
      badges.push({
        name: 'Excellence',
        icon: '🌟',
        description: 'Outstanding performance across all rounds!'
      });
    } else if (avgScore >= 60) {
      badges.push({
        name: 'Proficiency',
        icon: '⭐',
        description: 'Good performance with room for improvement.'
      });
    }

    return {
      overallScore: Math.round(avgScore),
      focusArea,
      rounds,
      badges,
      insights: [
        'Your performance shows potential for growth.',
        'Consistency across rounds is important for improvement.',
        'Consider the feedback from each round to enhance your approach.'
      ],
      recommendations: [
        'Practice responding to similar challenges to build your skills.',
        'Take time to reflect on your performance after each round.',
        'Focus on the areas identified for improvement in future challenges.'
      ]
    };
  }
}
