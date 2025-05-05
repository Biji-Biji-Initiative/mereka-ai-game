import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { RoundData } from '../../models/challenge.model';
import { StateService } from '../../services/state.service';

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
    private stateService: StateService
  ) { }

  ngOnInit() {
    console.log('DynamicRoundComponent initialized');
    this.routeSubscription = this.route.params.subscribe(params => {
      console.log('Route params:', params);
      const roundNumber = parseInt(params['round'], 10);
      console.log('Parsed round number:', roundNumber);
      if (roundNumber) {
        this.currentRoundNumber = roundNumber;
        this.loadCurrentRound();
      } else {
        console.error('No round number found in route params');
        this.router.navigate(['/focus']);
      }
    });

    // Log the current route
    console.log('Current route:', this.route.snapshot.url);
    console.log('Route config:', this.route.snapshot.routeConfig);

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
      const challengeId = localStorage.getItem('currentChallengeId');
      if (!challengeId) {
        console.error('No challenge ID found');
        this.router.navigate(['/focus']);
        return;
      }

      const challenge = await this.challengeService.getChallenge(challengeId);
      if (!challenge) {
        console.error('Challenge not found');
        this.router.navigate(['/focus']);
        return;
      }

      this.maxRounds = challenge.questions.length;
      this.currentRound = {
        question: challenge.questions[this.currentRoundNumber - 1],
        roundNumber: this.currentRoundNumber,
        answer: ''
      };

      // Load previous responses if any
      const userId = this.userService.getCurrentUserId();
      if (userId) {
        const previousResponse = await this.challengeService.getRoundResponse(
          userId,
          this.currentRoundNumber
        );
        if (previousResponse) {
          this.userResponse = previousResponse.response;
          this.evaluation = previousResponse.evaluation;
        }
      }
    } catch (error) {
      console.error('Error loading round:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async submitResponse() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.showAiThinking = true;
    this.stopTimer();

    try {
      const challengeId = localStorage.getItem('currentChallengeId');
      if (!challengeId) {
        throw new Error('No challenge ID found');
      }

      const response = await this.challengeService.submitResponse(challengeId, this.userResponse);
      this.evaluation = response.evaluation;

      // Save the response
      const userId = this.userService.getCurrentUserId();
      if (userId) {
        await this.challengeService.saveRoundResponse(
          userId,
          this.currentRoundNumber,
          {
            challengeId,
            response: this.userResponse,
            evaluation: this.evaluation,
            question: this.currentRound?.question || '',
            aiResponse: response.aiResponse || ''
          }
        );
      }

      // Navigate to next round or results
      if (this.currentRoundNumber < this.maxRounds) {
        this.router.navigate([`/round/${this.currentRoundNumber + 1}`]);
      } else {
        this.router.navigate(['/results']);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      this.isSubmitting = false;
      this.showAiThinking = false;
    }
  }

  getMetricValue(metric: string): number {
    return this.evaluation?.evaluation?.metrics?.[metric] || 0;
  }

  getMetricColor(metric: string): string {
    const value = this.getMetricValue(metric);
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
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
    return [
      { name: 'Accuracy Master', description: 'Achieved 90% accuracy' },
      { name: 'Speed Demon', description: 'Completed round in record time' }
    ];
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
