import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { RoundData, ChallengeResponse } from '../../models/challenge.model';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-dynamic-round',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-round.component.html',
  styleUrls: ['./dynamic-round.component.scss']
})
export class DynamicRoundComponent implements OnInit, OnDestroy {
  currentRound: RoundData | null = null;
  userResponse: string = '';
  isSubmitting: boolean = false;
  roundNumber: number = 1;
  evaluation: ChallengeResponse | null = null;
  showAiThinking: boolean = false;
  previousResponses: { [key: number]: string; } = {};
  currentRoundNumber: number = 1;
  isLoading: boolean = true;
  maxRounds: number = 4; // Default value, will be updated from challenge data

  // Timer properties
  timeLeft: number = 300; // 5 minutes in seconds
  timerInterval: any;
  progress: number = 100;

  // Define metrics for the template
  metrics = ['creativity', 'practicality', 'depth', 'humanEdge', 'overall'];

  constructor(
    private challengeService: ChallengeService,
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) { }

  ngOnInit() {
    console.log('DynamicRoundComponent initialized');
    this.route.params.subscribe(params => {
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
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timeLeft = 300; // Reset to 5 minutes
    this.progress = 100;

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.progress = (this.timeLeft / 300) * 100;
      } else {
        clearInterval(this.timerInterval);
        this.submitResponse(); // Auto-submit when time runs out
      }
    }, 1000);
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async loadCurrentRound() {
    const challengeId = localStorage.getItem('currentChallengeId');
    if (!challengeId) {
      console.error('No challenge ID found');
      this.router.navigate(['/focus']);
      return;
    }

    this.isLoading = true;

    // Reset evaluation and user response when loading a new round
    this.evaluation = null;
    this.userResponse = '';
    this.showAiThinking = false;

    try {
      const challenge = await this.challengeService.getChallenge(challengeId);
      if (!challenge) {
        console.error('Challenge not found');
        this.router.navigate(['/focus']);
        return;
      }

      // Set the maximum number of rounds from the number of questions in the challenge
      this.maxRounds = challenge.questions.length;

      // Initialize rounds array if it doesn't exist
      if (!challenge.rounds || !Array.isArray(challenge.rounds)) {
        challenge.rounds = [];
      }

      // Get or create the round
      let round = challenge.rounds.find(r => r.roundNumber === this.currentRoundNumber);
      if (!round) {
        round = {
          roundNumber: this.currentRoundNumber,
          question: challenge.questions[this.currentRoundNumber - 1] || 'No question available',
          answer: ''
        };
        await this.challengeService.addRound(challengeId, round);
      }

      this.currentRound = round;

      // Load previous responses
      this.loadPreviousResponses(challenge);
    } catch (error) {
      console.error('Error loading round:', error);
      this.router.navigate(['/focus']);
    } finally {
      this.isLoading = false;
    }
  }

  private loadPreviousResponses(challenge: any) {
    this.previousResponses = {};
    challenge.rounds.forEach((round: RoundData) => {
      if (round.roundNumber < this.currentRoundNumber && round.answer) {
        this.previousResponses[round.roundNumber] = round.answer;
      }
    });
  }

  async submitResponse() {
    if (!this.currentRound || !this.userResponse) return;

    this.isSubmitting = true;
    this.showAiThinking = true;
    try {
      const challengeId = localStorage.getItem('currentChallengeId');
      if (!challengeId) {
        throw new Error('No challenge ID found');
      }

      // Submit response and get evaluation
      this.evaluation = await this.challengeService.submitResponse(challengeId, this.userResponse);

      // Don't navigate immediately - let the user see the evaluation first
      // The user will click the continue button to move to the next round
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      this.isSubmitting = false;
      this.showAiThinking = false;
    }
  }

  handleContinue() {
    console.log(`Current round: ${this.currentRoundNumber}, Max rounds: ${this.maxRounds}`);
    if (this.currentRoundNumber < this.maxRounds) {
      console.log('Navigating to next round');
      this.navigationService.navigateToNextRound(this.currentRoundNumber, this.maxRounds);
    } else {
      console.log('Navigating to results page');
      this.router.navigate(['/results']);
    }
  }

  // Helper methods for the template
  getMetricValue(metric: string): number {
    if (!this.evaluation?.evaluation?.metrics) return 0;

    // Use type assertion to handle the dynamic property access
    const metrics = this.evaluation.evaluation.metrics as Record<string, number>;
    return metrics[metric] || 0;
  }

  getFeedback(): string[] {
    return this.evaluation?.evaluation?.feedback || [];
  }

  getStrengths(): string[] {
    return this.evaluation?.evaluation?.strengths || [];
  }

  getImprovements(): string[] {
    return this.evaluation?.evaluation?.improvements || [];
  }

  getBadges(): string[] {
    return this.evaluation?.evaluation?.badges || [];
  }

  getComparison(): any {
    return this.evaluation?.evaluation?.comparison || {
      userScore: 0,
      rivalScore: 0,
      advantage: 'tie',
      advantageReason: ''
    };
  }

  // Add a method to handle navigation
  navigateBack(): void {
    this.router.navigate(['/focus']);
  }
}
