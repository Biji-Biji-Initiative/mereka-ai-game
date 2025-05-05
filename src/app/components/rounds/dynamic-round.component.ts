import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { RoundData } from '../../models/challenge.model';
import { StateService } from '../../services/state.service';
import { RoundGeneratorService } from '../../services/round-generator.service';

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

  constructor(
    private challengeService: ChallengeService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private userService: UserService,
    private stateService: StateService,
    private roundGeneratorService: RoundGeneratorService
  ) { }

  async ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      const roundNumber = parseInt(params['round'], 10);
      if (roundNumber) {
        this.currentRoundNumber = roundNumber;
        this.loadCurrentRound();
      } else {
        this.router.navigate(['/focus']);
      }
    });

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

  async loadCurrentRound() {
    this.isLoading = true;
    try {
      const userId = this.userService.getCurrentUserId();
      if (!userId) throw new Error('No user ID found');

      // Get the current challenge
      const challenge = await this.challengeService.getChallenge(userId);
      if (!challenge) {
        this.router.navigate(['/focus']);
        return;
      }

      // Check if we need to generate a new round
      if (this.currentRoundNumber > challenge.rounds.length) {
        // Generate new round based on previous rounds and focus
        const round = await this.roundGeneratorService.generateRound(
          userId,
          challenge.focus.focusArea,
          JSON.stringify({
            previousRounds: challenge.rounds,
            focus: challenge.focus
          })
        );

        // Add the new round to the challenge
        await this.challengeService.addRound(challenge.id, {
          roundNumber: this.currentRoundNumber,
          question: round.challenges[0].question,
          answer: ''
        });

        // Reload the challenge to get the updated rounds
        const updatedChallenge = await this.challengeService.getChallenge(userId);
        if (!updatedChallenge) throw new Error('Failed to load updated challenge');

        this.currentRound = updatedChallenge.rounds[this.currentRoundNumber - 1];
      } else {
        this.currentRound = challenge.rounds[this.currentRoundNumber - 1];
      }

      // Load previous responses if any
      if (this.currentRound.answer) {
        this.userResponse = this.currentRound.answer;
      }
    } catch (error) {
      console.error('Error loading round:', error);
      this.router.navigate(['/focus']);
    } finally {
      this.isLoading = false;
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
