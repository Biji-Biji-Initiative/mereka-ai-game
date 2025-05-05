import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { RoundData } from '../../models/challenge.model';

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

  constructor(
    private challengeService: ChallengeService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private userService: UserService
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
}
