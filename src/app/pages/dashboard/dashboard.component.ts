import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ResultsAnalysisService, FinalResults } from '../../services/results-analysis.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';
import { collection, query, where, getDocs, Timestamp } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { UserContext } from '../../models/user.model';

interface SkillLevel {
  name: string;
  level: number;
  progress: number;
}

interface Challenge {
  title: string;
  score: number;
  focusArea: string;
  date: Date;
}

interface Badge {
  name: string;
  icon: string;
  description: string;
  date: Date;
}

interface DashboardData {
  level: number;
  overallProgress: number;
  challengesCompleted: number;
  totalBadges: number;
  streakDays: number;
  skillLevels: SkillLevel[];
  recentChallenges: Challenge[];
  badges: Badge[];
  insights: string[];
  recommendations: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData = {
    level: 1,
    overallProgress: 0,
    challengesCompleted: 0,
    totalBadges: 0,
    streakDays: 0,
    skillLevels: [],
    recentChallenges: [],
    badges: [],
    insights: [],
    recommendations: []
  };

  userContext: UserContext | null = null;
  hasTraits: boolean = false;
  traitsLastUpdated: Date | null = null;
  hasAttitudes: boolean = false;
  attitudesLastUpdated: Date | null = null;

  constructor(
    private gameService: GameService,
    private resultsAnalysisService: ResultsAnalysisService,
    private userService: UserService,
    private loadingService: LoadingService,
    private firestore: Firestore,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.loadDashboardData();
    await this.loadUserProfile();
  }

  private async loadUserProfile(): Promise<void> {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    try {
      // Load user context
      const user = await this.userService.getUser(userId);
      if (user) {
        this.userContext = {
          name: user.name,
          email: user.email,
          professionalTitle: user.professionalTitle,
          location: user.location
        };
      }

      // Load traits data
      const traits = await this.userService.getUserTraits(userId);
      this.hasTraits = !!traits;
      if (traits) {
        // Get the last updated timestamp from Firestore
        const traitsRef = collection(this.firestore, 'users');
        const traitsQuery = query(traitsRef, where('id', '==', userId));
        const traitsSnapshot = await getDocs(traitsQuery);

        if (!traitsSnapshot.empty) {
          const userDoc = traitsSnapshot.docs[0];
          const traitsData = userDoc.data();
          if (traitsData['traits']?.['updatedAt']) {
            this.traitsLastUpdated = (traitsData['traits']['updatedAt'] as Timestamp).toDate();
          } else {
            this.traitsLastUpdated = new Date();
          }
        }
      }

      // Load attitudes data
      const attitudes = await this.userService.getUserAttitudes(userId);
      this.hasAttitudes = !!attitudes;
      if (attitudes) {
        // Get the last updated timestamp from Firestore
        const attitudesRef = collection(this.firestore, 'users');
        const attitudesQuery = query(attitudesRef, where('id', '==', userId));
        const attitudesSnapshot = await getDocs(attitudesQuery);

        if (!attitudesSnapshot.empty) {
          const userDoc = attitudesSnapshot.docs[0];
          const attitudesData = userDoc.data();
          if (attitudesData['attitudes']?.['updatedAt']) {
            this.attitudesLastUpdated = (attitudesData['attitudes']['updatedAt'] as Timestamp).toDate();
          } else {
            this.attitudesLastUpdated = new Date();
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  updateContext(): void {
    this.router.navigate(['/context']);
  }

  updateTraits(): void {
    this.router.navigate(['/traits']);
  }

  updateAttitudes(): void {
    this.router.navigate(['/attitudes']);
  }

  private async loadDashboardData(): Promise<void> {
    this.loadingService.show();
    try {
      const userId = this.userService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID found');
      }

      // Get completed challenges from Firestore
      const challengesRef = collection(this.firestore, 'challenges');
      const q = query(challengesRef,
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);
      const completedChallenges = querySnapshot.size;

      // Get all final reports for completed challenges
      const finalReportsRef = collection(this.firestore, 'final_results');
      const finalReportsQuery = query(finalReportsRef, where('userId', '==', userId));
      const finalReportsSnapshot = await getDocs(finalReportsQuery);

      // Aggregate data from all final reports
      let allBadges: any[] = [];
      let allInsights: string[] = [];
      let allRecommendations: string[] = [];
      let totalScore = 0;
      let totalRounds = 0;
      let skillLevels: Record<string, number> = {};
      let recentChallenges: any[] = [];

      finalReportsSnapshot.forEach(doc => {
        const data = doc.data() as FinalResults;

        // Process badges
        if (data.badges) {
          allBadges = [...allBadges, ...data.badges];
        }

        // Process insights and recommendations
        if (data.insights) {
          allInsights = [...allInsights, ...data.insights];
        }
        if (data.recommendations) {
          allRecommendations = [...allRecommendations, ...data.recommendations];
        }

        // Process rounds and calculate scores
        if (data.rounds) {
          const roundScores = Object.values(data.rounds).map(round => round.score);
          totalScore += roundScores.reduce((sum, score) => sum + score, 0);
          totalRounds += roundScores.length;

          // Process skill levels from rounds
          Object.values(data.rounds).forEach(round => {
            if (round.strengths) {
              round.strengths.forEach(strength => {
                const skillName = strength.toLowerCase().replace(/\s+/g, '-');
                skillLevels[skillName] = (skillLevels[skillName] || 0) + 1;
              });
            }
          });

          // Add to recent challenges
          recentChallenges.push({
            title: data.focusArea?.name || 'Challenge',
            score: Math.round(roundScores.reduce((sum, score) => sum + score, 0) / roundScores.length),
            focusArea: data.focusArea?.name || 'General',
            date: doc.data()['timestamp'] || new Date()
          });
        }
      });

      // Calculate average score
      const averageScore = totalRounds > 0 ? totalScore / totalRounds : 0;

      // Calculate level based on completed challenges and average score
      const level = Math.floor(completedChallenges / 5) + 1; // Level up every 5 challenges

      // Calculate streak days (placeholder - you might want to implement actual streak logic)
      const streakDays = Math.min(completedChallenges, 7); // Max 7 days for now

      // Transform and set the dashboard data
      this.dashboardData = {
        level,
        overallProgress: Math.round((averageScore / 100) * 100),
        challengesCompleted: completedChallenges,
        totalBadges: allBadges.length,
        streakDays,
        skillLevels: this.transformSkillLevels(skillLevels),
        recentChallenges: this.transformChallenges(recentChallenges),
        badges: this.transformBadges(allBadges),
        insights: allInsights.length > 0 ? allInsights : [
          'Your performance shows potential for growth.',
          'Consistency across rounds is important for improvement.',
          'Consider the feedback from each round to enhance your approach.'
        ],
        recommendations: allRecommendations.length > 0 ? allRecommendations : [
          'Practice responding to similar challenges to build your skills.',
          'Take time to reflect on your performance after each round.',
          'Focus on the areas identified for improvement in future challenges.'
        ]
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Handle error appropriately
    } finally {
      this.loadingService.hide();
    }
  }

  private transformSkillLevels(skillLevels: Record<string, number>): SkillLevel[] {
    return Object.entries(skillLevels).map(([name, level]) => ({
      name: this.formatSkillName(name),
      level,
      progress: this.calculateSkillProgress(level)
    }));
  }

  private transformChallenges(challenges: any[]): Challenge[] {
    return challenges.map(challenge => ({
      ...challenge,
      date: new Date(challenge.date)
    }));
  }

  private transformBadges(badges: any[]): Badge[] {
    return badges.map(badge => ({
      name: badge.name,
      icon: badge.icon || '🏆',
      description: badge.description,
      date: new Date()
    }));
  }

  private calculateOverallProgress(finalResults: FinalResults | null): number {
    if (!finalResults) return 0;

    // Calculate average score from all rounds
    const roundScores = Object.values(finalResults.rounds).map(round => round.score);
    if (roundScores.length === 0) return 0;

    const averageScore = roundScores.reduce((sum, score) => sum + score, 0) / roundScores.length;
    return Math.round((averageScore / 100) * 100);
  }

  private calculateChallengesCompleted(finalResults: FinalResults | null): number {
    if (!finalResults) return 0;
    return Object.keys(finalResults.rounds).length;
  }

  private formatSkillName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private calculateSkillProgress(level: number): number {
    // Assuming each level requires 100 points and max level is 10
    return (level / 10) * 100;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}
