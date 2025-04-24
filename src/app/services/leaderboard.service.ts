import { Injectable } from '@angular/core';
import { Firestore, collection, query, orderBy, limit, getDocs, where, doc, getDoc, DocumentData } from '@angular/fire/firestore';
import { ResultsAnalysisService, FinalResults } from './results-analysis.service';
import { UserContext } from './user.service';
import { ChallengeService } from './challenge.service';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  challenges: number;
  badges: string[];
  focusArea: string;
  recentScore: number;
}

// Define user data interface
interface UserData extends DocumentData {
  displayName?: string;
  challengesCompleted?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly LEADERBOARD_LIMIT = 100;

  constructor(
    private firestore: Firestore,
    private resultsAnalysisService: ResultsAnalysisService,
    private challengeService: ChallengeService
  ) { }

  async getLeaderboard(timeFrame: 'all' | 'month' | 'week' | 'day' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      // Get all final results
      const resultsRef = collection(this.firestore, 'final_results');
      let q = query(resultsRef, orderBy('overallScore', 'desc'), limit(this.LEADERBOARD_LIMIT));

      // Apply time filter if needed
      if (timeFrame !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (timeFrame) {
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
      const entries: LeaderboardEntry[] = [];

      // Process each result
      for (let i = 0;i < querySnapshot.docs.length;i++) {
        const resultDoc = querySnapshot.docs[i];
        const data = resultDoc.data() as FinalResults & { userId: string, timestamp: string; };

        // Get user details
        const userRef = doc(this.firestore, `users/${data.userId}`);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() as UserContext : null;
        console.log('userData', userData);

        // Get user's challenges count using a length query
        const challengesRef = collection(this.firestore, 'challenges');
        const challengesQuery = query(challengesRef, where('userId', '==', data.userId));
        const challengesSnapshot = await getDocs(challengesQuery);
        const challengesCount = challengesSnapshot.size;

        entries.push({
          rank: i + 1,
          userId: data.userId,
          name: userData?.name || 'Anonymous User',
          score: data.overallScore,
          challenges: challengesCount,
          badges: data.badges.map(b => b.name),
          focusArea: data.focusArea?.name || 'General',
          recentScore: data.overallScore
        });
      }

      return entries;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return [];
    }
  }
}
