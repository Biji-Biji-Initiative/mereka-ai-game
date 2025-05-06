import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError, from } from 'rxjs';
import { catchError, delay, retry, timeout, map, switchMap } from 'rxjs/operators';
import { RoundEvaluationService, EvaluationResponse } from './round-evaluation.service';
import { Firestore, collection, doc, getDoc, getDocs, query, where, setDoc } from '@angular/fire/firestore';
import { Challenge, FocusData } from './challenge.service';

// Progress Analysis interface matching ProgressPromptBuilder.js structure
export interface ProgressAnalysis {
  overallProgress: {
    summary: string;
    score: number;
    achievements: string[];
    growthAreas: string[];
  };
  focusAreaProgress: Array<{
    name: string;
    level: number;
    strengths: string[];
    weaknesses: string[];
    improvement: string;
    recommendations: string[];
  }>;
  skillBreakdown: Array<{
    name: string;
    currentLevel: number;
    previousLevel: number;
    improvement: string;
    notes: string;
  }>;
  growthTrajectory: {
    pattern: string;
    projectedGrowth: string;
    timeToNextLevel: string;
  };
  recommendations: {
    priorities: string[];
    suggestedChallenges: string[];
    learningResources: string[];
    customizedPlan: string;
  };
}

// Final Results interface for backward compatibility
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
  private readonly TIMEOUT_MS = 50000;
  private readonly RESULTS_COLLECTION = 'final_results';
  private readonly PROGRESS_COLLECTION = 'progress_analysis';

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private roundEvaluationService: RoundEvaluationService
  ) { }

  analyzeResults(challengeId: string, userId: string): Observable<FinalResults> {
    return from(this.getCachedResults(userId, challengeId)).pipe(
      switchMap(cachedResult => {
        if (cachedResult) {
          return of(cachedResult);
        }
        return from(this.fetchRoundEvaluations(userId, challengeId)).pipe(
          switchMap(evaluations => {
            if (!evaluations || evaluations.length === 0) {
              return throwError(() => new Error('No round evaluations found to analyze'));
            }
            return from(this.generateFinalReport(userId, challengeId, evaluations));
          })
        );
      })
    );
  }

  analyzeProgress(userId: string, options: {
    timeRange?: 'all' | 'month' | 'week' | 'day';
    detailLevel?: 'comprehensive' | 'detailed' | 'basic';
    includePredictions?: boolean;
    includeRecommendations?: boolean;
    focusAreas?: string[];
  } = {}): Observable<ProgressAnalysis> {
    return from(this.getCachedProgress(userId, options)).pipe(
      switchMap(cachedProgress => {
        if (cachedProgress) {
          return of(cachedProgress);
        }
        return from(this.fetchUserData(userId)).pipe(
          switchMap(userData => {
            if (!userData) {
              return throwError(() => new Error('User data not found'));
            }
            return from(this.fetchChallengeHistory(userId, options.timeRange)).pipe(
              switchMap(challengeHistory => {
                if (!challengeHistory || challengeHistory.length === 0) {
                  return throwError(() => new Error('No challenge history found'));
                }
                return from(this.generateProgressAnalysis(userId, userData, challengeHistory, options));
              })
            );
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
      throw error;
    }
  }

  private async fetchRoundEvaluations(userId: string, challengeId: string): Promise<EvaluationResponse[]> {
    try {
      const challengeRef = doc(this.firestore, `challenges/${challengeId}`);
      const challengeDoc = await getDoc(challengeRef);

      if (!challengeDoc.exists()) {
        throw new Error('Challenge document not found');
      }

      const challengeData = challengeDoc.data() as Challenge;
      const rounds = challengeData.rounds || [];

      const evaluations: EvaluationResponse[] = rounds.map(round => {
        const evaluation = round.evaluation || {};
        return {
          metrics: {
            creativity: evaluation['creativity'] || 0,
            practicality: evaluation['practicality'] || 0,
            depth: evaluation['depth'] || 0,
            humanEdge: evaluation['humanEdge'] || 0,
            overall: evaluation['overall'] || 0
          },
          feedback: Array.isArray(evaluation['feedback']) ? evaluation['feedback'] : [],
          strengths: Array.isArray(evaluation['strengths']) ? evaluation['strengths'] : [],
          improvements: Array.isArray(evaluation['improvements']) ? evaluation['improvements'] : [],
          comparison: {
            userScore: evaluation['userScore'] || 0,
            rivalScore: evaluation['rivalScore'] || 0,
            advantage: evaluation['advantage'] || 'tie',
            advantageReason: evaluation['advantageReason'] || ''
          },
          badges: Array.isArray(evaluation['badges']) ? evaluation['badges'] : []
        };
      });

      if (evaluations.length === 0) {
        throw new Error('No evaluations found for this challenge');
      }

      return evaluations;
    } catch (error) {
      console.error('Error fetching challenge evaluation:', error);
      throw error;
    }
  }

  private async generateFinalReport(
    userId: string,
    challengeId: string,
    evaluations: EvaluationResponse[]
  ): Promise<FinalResults> {
    try {
      const challengeRef = doc(this.firestore, `challenges/${challengeId}`);
      const challengeDoc = await getDoc(challengeRef);
      const challengeData = challengeDoc.exists() ? (challengeDoc.data() as Challenge) : null;

      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : null;

      const request = this.createAnalysisRequest(userId, challengeId, evaluations, challengeData, userData);
      const response = await this.callCloudFunctionWithRetry(request);

      let finalResults: FinalResults;
      try {
        const cleanedContent = response.data.choices[0].message.content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        finalResults = JSON.parse(cleanedContent) as FinalResults;
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Failed to parse AI analysis response');
      }

      if (challengeData?.focus) {
        finalResults.focus = challengeData.focus;
      }

      if (userData) {
        finalResults.traits = userData['traits'] || [];
        finalResults.attitudes = userData['attitudes'] || [];
      }

      await this.cacheResults(userId, challengeId, finalResults);
      return finalResults;
    } catch (error) {
      console.error('Error generating final report:', error);
      throw error;
    }
  }

  private async callCloudFunctionWithRetry(request: any): Promise<CloudFunctionResponse> {
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
          throw new Error('No valid response from analysis service');
        }

        return response;
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
      const docId = `${userId}_${challengeId}`;
      const resultsWithMetadata = {
        ...results,
        userId,
        challengeId,
        timestamp: new Date().toISOString()
      };

      await setDoc(doc(this.firestore, this.RESULTS_COLLECTION, docId), resultsWithMetadata);
    } catch (error) {
      console.error('Error caching results:', error);
      throw error;
    }
  }

  private async getCachedProgress(
    userId: string,
    options: any
  ): Promise<ProgressAnalysis | null> {
    try {
      const progressRef = collection(this.firestore, this.PROGRESS_COLLECTION);
      const q = query(progressRef,
        where('userId', '==', userId),
        where('timeRange', '==', options.timeRange || 'all')
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data() as ProgressAnalysis;
      }
      return null;
    } catch (error) {
      console.error('Error fetching cached progress:', error);
      throw error;
    }
  }

  private async fetchUserData(userId: string): Promise<any> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      return userDoc.data();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  private async fetchChallengeHistory(
    userId: string,
    timeRange?: string
  ): Promise<any[]> {
    try {
      const challengesRef = collection(this.firestore, 'challenges');
      let q = query(challengesRef, where('userId', '==', userId));

      if (timeRange && timeRange !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'day':
            startDate.setDate(now.getDate() - 1);
            break;
        }

        q = query(q, where('timestamp', '>=', startDate.toISOString()));
      }

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('No challenges found for the specified time range');
      }
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching challenge history:', error);
      throw error;
    }
  }

  private async generateProgressAnalysis(
    userId: string,
    userData: any,
    challengeHistory: any[],
    options: any
  ): Promise<ProgressAnalysis> {
    try {
      const request = this.createProgressAnalysisRequest(userId, userData, challengeHistory, options);
      const response = await this.callCloudFunctionWithRetry(request);

      let progressAnalysis: ProgressAnalysis;
      try {
        const cleanedContent = response.data.choices[0].message.content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        progressAnalysis = JSON.parse(cleanedContent) as ProgressAnalysis;
      } catch (parseError) {
        console.error('Error parsing progress analysis:', parseError);
        throw new Error('Failed to parse progress analysis response');
      }

      await this.cacheProgress(userId, options, progressAnalysis);
      return progressAnalysis;
    } catch (error) {
      console.error('Error generating progress analysis:', error);
      throw error;
    }
  }

  private createProgressAnalysisRequest(
    userId: string,
    userData: any,
    challengeHistory: any[],
    options: any
  ): any {
    const systemMessage = {
      role: 'system',
      content: `You are an AI progress analyst specializing in learning journey assessment and personalized recommendations.
Your analysis should be data-driven, balanced, and provide ${options.detailLevel || 'detailed'} insights into the user's progress over the ${options.timeRange || 'all'} time period.
${options.includeRecommendations ? 'Include specific, actionable recommendations that align with their learning goals and current trajectory.' : ''}
${options.includePredictions ? 'Include evidence-based predictions about their future growth based on current trends.' : ''}
Ensure your response follows the exact JSON format specified in the instructions, with no extraneous text.`
    };

    const userMessage = {
      role: 'user',
      content: `Analyze the following data:
      User ID: ${userId}
      User Data: ${JSON.stringify(userData)}
      Challenge History: ${JSON.stringify(challengeHistory)}
      Options: ${JSON.stringify(options)}`
    };

    return {
      model: "gpt-4o",
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 10000
    };
  }

  private async cacheProgress(
    userId: string,
    options: any,
    progress: ProgressAnalysis
  ): Promise<void> {
    try {
      const docId = `${userId}_${options.timeRange || 'all'}`;
      const progressWithMetadata = {
        ...progress,
        userId,
        timeRange: options.timeRange || 'all',
        timestamp: new Date().toISOString()
      };

      await setDoc(doc(this.firestore, this.PROGRESS_COLLECTION, docId), progressWithMetadata);
    } catch (error) {
      console.error('Error caching progress:', error);
      throw error;
    }
  }
}
