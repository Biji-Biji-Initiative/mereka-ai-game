import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { RoundData, ChallengeResponse } from '../../models/challenge.model';

@Component({
  selector: 'app-dynamic-round',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-round.component.html',
  styleUrls: ['./dynamic-round.component.scss']
})
export class DynamicRoundComponent implements OnInit {
  currentRound: RoundData | null = null;
  userResponse: string = '';
  isSubmitting: boolean = false;
  roundNumber: number = 1;
  evaluation: ChallengeResponse | null = null;
  showAiThinking: boolean = false;
  previousResponses: { [key: number]: string; } = {};

  // Define metrics for the template
  metrics = ['creativity', 'practicality', 'depth', 'humanEdge', 'overall'];

  constructor(
    private challengeService: ChallengeService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    // Get the round number from the route parameter
    this.route.params.subscribe(params => {
      this.roundNumber = parseInt(params['round'], 10);
      this.loadCurrentRound();
    });
  }

  private async loadCurrentRound() {
    try {
      const challengeId = localStorage.getItem('currentChallengeId');
      if (!challengeId) {
        this.router.navigate(['/focus']);
        return;
      }

      const challenge = await this.challengeService.getChallenge(challengeId);
      if (challenge) {
        // Set the current round based on the route parameter
        this.currentRound = challenge.rounds[this.roundNumber - 1];

        // If this round doesn't exist yet, create it
        if (!this.currentRound) {
          this.currentRound = {
            roundNumber: this.roundNumber,
            question: challenge.questions[this.roundNumber - 1] || 'No question available',
            answer: ''
          };
        }

        // Load previous responses
        this.loadPreviousResponses(challenge);
      }
    } catch (error) {
      console.error('Error loading round:', error);
    }
  }

  private loadPreviousResponses(challenge: any) {
    this.previousResponses = {};
    challenge.rounds.forEach((round: RoundData) => {
      if (round.roundNumber < this.roundNumber && round.answer) {
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

      // Move to next round or complete the challenge
      if (this.roundNumber < 4) {
        this.router.navigate(['/round', this.roundNumber + 1]);
      } else {
        this.router.navigate(['/complete']);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      this.isSubmitting = false;
      this.showAiThinking = false;
    }
  }

  handleContinue() {
    if (this.roundNumber < 4) {
      this.router.navigate(['/round', this.roundNumber + 1]);
    } else {
      this.router.navigate(['/complete']);
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
}
