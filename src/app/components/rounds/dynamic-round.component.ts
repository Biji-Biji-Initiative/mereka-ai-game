import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../services/challenge.service';
import { RoundEvaluationService, EvaluationResponse } from '../../services/round-evaluation.service';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { RoundData, Challenge } from '../../models/challenge.model';
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
  styleUrl: './dynamic-round.component.scss'
})
export class DynamicRoundComponent implements OnInit {
  currentRound: RoundData | null = null;
  currentRoundNumber: number = 1;
  maxRounds: number = 3;
  userResponse: string = '';
  isSubmitting: boolean = false;
  showAiThinking: boolean = false;
  showPerformance: boolean = false;
  showQuestion: boolean = true;
  performanceMetrics: EvaluationResponse | null = null;
  evaluation: any = null;
  roundNumber = 1;
  previousResponses: { [key: string]: string; } = {};
  timeLeft = 300;
  timer: any;
  progress: number = 0;
  timeRemaining: number = 60;
  metrics: Metric[] = [];
  error: string | null = null;
  isLoading: boolean = false;
  challenge: Challenge | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private roundEvaluationService: RoundEvaluationService,
    private roundGeneratorService: RoundGeneratorService,
    private loadingService: LoadingService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadRound();
  }

  async loadRound() {
    this.isLoading = true;
    this.error = null;
    try {
      const challengeId = this.route.snapshot.paramMap.get('challengeId');
      if (!challengeId) {
        this.router.navigate(['/focus']);
        return;
      }

      this.challenge = await this.challengeService.getChallenge(challengeId);
      if (!this.challenge) {
        this.router.navigate(['/focus']);
        return;
      }

      // Ensure rounds is an array
      const rounds = Array.isArray(this.challenge.rounds) ? this.challenge.rounds : [];

      // Determine current round based on completed rounds
      const completedRounds = rounds.filter((round: RoundData) => round && round.evaluation);
      this.currentRoundNumber = completedRounds.length + 1;

      // If all rounds are completed, redirect to results
      if (this.currentRoundNumber > this.maxRounds) {
        this.router.navigate(['/results', challengeId]);
        return;
      }

      // Check if we need to generate a new round
      if (this.currentRoundNumber > 1) {
        const previousRound = rounds[this.currentRoundNumber - 2];
        if (!previousRound || !previousRound.evaluation) {
          // Previous round not completed, redirect to it
          this.router.navigate(['/round', challengeId]);
          return;
        }
      }

      // Get or generate the current round
      if (rounds[this.currentRoundNumber - 1]) {
        this.currentRound = rounds[this.currentRoundNumber - 1];
      } else {
        // Generate new round using AI based on previous rounds
        const previousRounds = rounds.slice(0, this.currentRoundNumber - 1);
        const generatedRound = await this.roundGeneratorService.generateRound(
          this.challenge.focus.focusArea,
          this.currentRoundNumber.toString(),
          previousRounds.length > 0 ? JSON.stringify({
            previousRounds,
            focus: this.challenge.focus
          }) : undefined
        );

        // Get the first challenge from the generated round
        const firstChallenge = generatedRound.challenges[0];

        this.currentRound = {
          roundNumber: this.currentRoundNumber,
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
    if (!this.currentRound || !this.userResponse.trim()) return;

    this.isSubmitting = true;
    this.showAiThinking = true;
    this.error = null;
    try {
      const challengeId = this.route.snapshot.paramMap.get('challengeId');
      if (!challengeId) {
        throw new Error('No challenge ID found');
      }

      // Submit response and get evaluation
      this.evaluation = (await this.challengeService.submitResponse(challengeId, this.userResponse)).evaluation;
      // Show performance metrics and hide question
      this.performanceMetrics = this.evaluation;
      this.showPerformance = true;
      this.showQuestion = false;

      // Don't navigate immediately - let the user see the evaluation first
      // The user will click the continue button to move to the next round
    } catch (error) {
      console.error('Error submitting response:', error);
      this.error = 'Failed to submit response. Please try again.';
    } finally {
      this.isSubmitting = false;
      this.showAiThinking = false;
    }
  }

  getMetricValue(metricName: string): number {
    if (!this.performanceMetrics?.metrics) return 0;
    return this.performanceMetrics.metrics[metricName as keyof typeof this.performanceMetrics.metrics] || 0;
  }

  getMetricColor(metricName: string): string {
    const value = this.getMetricValue(metricName);
    if (value >= 80) return 'bg-success';
    if (value >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  getComparisonText(): string {
    if (!this.performanceMetrics?.comparison) return '';
    const comparison = this.performanceMetrics.comparison;
    return comparison.advantage === 'user' ? 'You' :
      comparison.advantage === 'rival' ? 'AI' : 'Tie';
  }

  getComparisonReason(): string {
    return this.performanceMetrics?.comparison?.advantageReason || '';
  }

  getUserScore(): number {
    return this.performanceMetrics?.comparison?.userScore || 0;
  }

  getRivalScore(): number {
    return this.performanceMetrics?.comparison?.rivalScore || 0;
  }

  getFeedback(): string[] {
    return this.performanceMetrics?.feedback || [];
  }

  getStrengths(): string[] {
    return this.performanceMetrics?.strengths || [];
  }

  getImprovements(): string[] {
    return this.performanceMetrics?.improvements || [];
  }

  getBadges(): string[] {
    return this.performanceMetrics?.badges || [];
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

  async handleContinue() {
    const challengeId = this.route.snapshot.paramMap.get('challengeId');
    if (!challengeId) return;

    // Reset component state
    this.showQuestion = true;
    this.showPerformance = false;
    this.evaluation = null;
    this.performanceMetrics = null;
    this.userResponse = '';
    this.isSubmitting = false;
    this.showAiThinking = false;
    this.error = null;

    if (this.currentRoundNumber === this.maxRounds) {
      this.router.navigate(['/results']);
    } else {
      // Update challenge status to next round
      await this.challengeService.updateChallengeStatus(challengeId, 'in-progress');
      // Reload the component to show the next round
      this.router.navigate(['/round', challengeId]).then(() => {
        // Force reload the component
        window.location.reload();
      });
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
