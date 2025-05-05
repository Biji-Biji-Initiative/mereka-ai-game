import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { RoundData, Challenge } from '../../models/challenge.model';
import { StateService } from '../../services/state.service';
import { RoundGeneratorService } from '../../services/round-generator.service';
import { RoundEvaluationService } from '../../services/round-evaluation.service';

interface Metric {
  name: string;
  value: number;
  max: number;
}

interface Feedback {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface Comparison {
  userScore: number;
  rivalScore: number;
  advantage: 'user' | 'rival' | 'tie';
  advantageReason: string;
}

interface Badge {
  name: string;
  description: string;
}

@Component({
  selector: 'app-dynamic-round',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-round.component.html',
  styleUrls: ['./dynamic-round.component.scss']
})
export class DynamicRoundComponent implements OnInit, OnDestroy {
  challenge: Challenge | null = null;
  currentRound: RoundData | null = null;
  userResponse = '';
  isSubmitting = false;
  roundNumber = 1;
  evaluation: any = null;
  showAiThinking = false;
  previousResponses: { [key: string]: string; } = {};
  currentRoundNumber = 1;
  isLoading = true;
  maxRounds = 4;
  timeLeft = 300;
  timer: any;
  private routeSubscription: any;
  progress: number = 0;
  timeRemaining: number = 60;
  metrics: Metric[] = [];
  error: string | null = null;

  constructor(
    private challengeService: ChallengeService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private userService: UserService,
    private stateService: StateService,
    private roundGeneratorService: RoundGeneratorService,
    private roundEvaluationService: RoundEvaluationService
  ) { }

  async ngOnInit() {
    const challengeId = this.route.snapshot.paramMap.get('challengeId');
    const roundNumber = Number(this.route.snapshot.paramMap.get('roundNumber'));

    if (!challengeId || !roundNumber) {
      this.error = 'Invalid challenge or round number';
      this.isLoading = false;
      return;
    }

    try {
      // Get the challenge
      const challenge = await this.challengeService.getChallenge(challengeId);
      if (!challenge) {
        this.error = 'Challenge not found';
        this.isLoading = false;
        return;
      }

      this.challenge = challenge;

      // Check if the requested round is valid
      if (roundNumber < 1 || roundNumber > 3) {
        this.error = 'Invalid round number';
        this.isLoading = false;
        return;
      }

      // If the challenge is completed, redirect to results
      if (challenge.status === 'completed') {
        await this.router.navigate(['/results', challengeId]);
        return;
      }

      // If the requested round is not the current round, redirect to the current round
      if (roundNumber !== challenge.currentRound) {
        await this.router.navigate(['/round', challengeId, challenge.currentRound]);
        return;
      }

      // Get or generate the current round
      const existingRound = challenge.rounds[roundNumber - 1];
      if (existingRound) {
        this.currentRound = existingRound;
      } else {
        // Generate new round using AI
        const generatedRound = await this.roundGeneratorService.generateRound(
          challenge.focus.focusArea,
          roundNumber.toString(),
          roundNumber === 1 ? undefined : JSON.stringify({
            previousRounds: challenge.rounds.slice(0, roundNumber - 1),
            focus: challenge.focus
          })
        );

        // Get the first challenge from the generated round
        const firstChallenge = generatedRound.challenges[0];

        this.currentRound = {
          roundNumber,
          question: firstChallenge.question,
          answer: '',
          aiResponse: ''
        };

        // Save the round to the challenge
        await this.challengeService.addRound(challengeId, this.currentRound);
      }
    } catch (error) {
      console.error('Error loading round:', error);
      this.error = 'Failed to load round. Please try again.';
    } finally {
      this.isLoading = false;
    }

    this.startTimer();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.stopTimer();
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.stopTimer();
        this.submitResponse();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async submitResponse() {
    if (!this.userResponse.trim()) return;

    this.isSubmitting = true;
    this.loadingService.show();
    try {
      const userId = this.userService.getCurrentUserId();
      if (!userId) throw new Error('No user ID found');

      // Save the response
      await this.challengeService.saveResponse({
        challengeId: userId,
        response: this.userResponse,
        aiResponse: '',
        evaluation: {
          metrics: {
            creativity: 0,
            practicality: 0,
            depth: 0,
            humanEdge: 0,
            overall: 0
          },
          feedback: [],
          strengths: [],
          improvements: [],
          comparison: {
            userScore: 0,
            rivalScore: 0,
            advantage: 'tie',
            advantageReason: ''
          },
          badges: []
        },
        question: this.currentRound?.question || ''
      });

      // Update the round with the answer
      if (this.currentRound) {
        await this.challengeService.addRound(userId, {
          ...this.currentRound,
          answer: this.userResponse
        });
      }

      // Navigate to results if it's the last round
      if (this.currentRoundNumber === this.maxRounds) {
        this.router.navigate(['/results']);
      } else {
        // Navigate to next round
        this.router.navigate(['/round', this.currentRoundNumber + 1]);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      this.isSubmitting = false;
      this.loadingService.hide();
    }
  }

  getMetricValue(metric: Metric): number {
    return metric.value;
  }

  getMetricColor(metric: Metric): string {
    const percentage = (metric.value / metric.max) * 100;
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  private initializeRound() {
    this.progress = 0;
    this.timeRemaining = 60;
    this.metrics = [
      { name: 'Accuracy', value: 0, max: 100 },
      { name: 'Speed', value: 0, max: 100 },
      { name: 'Strategy', value: 0, max: 100 }
    ];
    this.startTimer();
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  navigateBack() {
    if (this.currentRoundNumber > 1) {
      this.router.navigate(['/round', this.currentRoundNumber - 1]);
    } else {
      this.router.navigate(['/focus']);
    }
  }

  getFeedback(): Feedback[] {
    return [
      { text: 'Great job on accuracy!', type: 'positive' },
      { text: 'Try to improve your speed', type: 'negative' },
      { text: 'Your strategy is improving', type: 'neutral' }
    ];
  }

  getComparison(): Comparison {
    return {
      userScore: 75,
      rivalScore: 65,
      advantage: 'user',
      advantageReason: 'Better accuracy and strategy'
    };
  }

  getStrengths(): string[] {
    return ['High accuracy', 'Good strategy', 'Consistent performance'];
  }

  getImprovements(): string[] {
    return ['Increase speed', 'Better time management', 'More aggressive play'];
  }

  getBadges(): Badge[] {
    return this.evaluation?.badges || [];
  }

  handleContinue() {
    if (this.currentRoundNumber < 5) {
      this.router.navigate(['/round', this.currentRoundNumber + 1]);
    } else {
      this.router.navigate(['/results']);
    }
  }

  private handleRoundComplete() {
    // Update metrics with final values
    this.metrics = this.metrics.map(metric => ({
      ...metric,
      value: Math.floor(Math.random() * metric.max)
    }));
  }
}
