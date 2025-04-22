import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent, RoundChallenge } from './base-round.component';
import { ChallengeService, RoundData } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-round1',
  templateUrl: './base-round.component.html',
  styleUrls: ['./round1.component.scss'],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class Round1Component extends BaseRoundComponent {
  constructor(
    protected override router: Router,
    private challengeService: ChallengeService,
    private userService: UserService,
    private loadingService: LoadingService,
    private navigationService: NavigationService
  ) {
    super(router);
    this.roundNumber = 1;
  }

  protected override async loadChallenge(): Promise<void> {
    this.loadingService.show();
    try {
      // Get challenge ID from localStorage
      const challengeId = localStorage.getItem('mereka_challenge_id');

      if (!challengeId) {
        throw new Error('No challenge ID found');
      }

      // Get challenge data
      const challenge = await this.challengeService.getChallenge(challengeId);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Set up round 1 challenge based on focus area
      this.challenge = {
        id: challengeId,
        title: 'Round 1: Initial Challenge',
        description: this.generateQuestion(challenge.focus.focusArea),
        steps: [
          'Read the question carefully',
          'Think about your unique human perspective',
          'Provide a detailed response'
        ]
      };

      this.isLoading = false;
    } catch (error) {
      console.error('Error loading challenge:', error);
      this.router.navigate(['/focus']);
    } finally {
      this.loadingService.hide();
    }
  }

  private generateQuestion(focusArea: string): string {
    // Generate question based on focus area
    switch (focusArea) {
      case 'creative':
        return 'How would you solve a complex problem in a creative way that AI might not think of?';
      case 'analytical':
        return 'Analyze this logical problem and explain your reasoning step by step.';
      case 'emotional':
        return 'How would you handle this emotionally challenging situation?';
      case 'ethical':
        return 'What ethical considerations would you take into account in this scenario?';
      default:
        return 'Please provide your response to this challenge.';
    }
  }

  protected override async submitResponse(): Promise<void> {
    if (!this.challenge?.id || !this.userResponse) return;

    try {
      // Create round data
      const roundData: RoundData = {
        roundNumber: 1,
        question: this.challenge.description,
        answer: this.userResponse
      };

      // Add round data to challenge
      await this.challengeService.addRound(this.challenge.id, roundData);
    } catch (error) {
      console.error('Error submitting round:', error);
    }
  }

  protected override async evaluateResponse(): Promise<void> {
    // For now, we'll just proceed to the next round
    // You can implement AI evaluation logic here later
    this.evaluation = {
      metrics: {
        creativity: 85,
        practicality: 80,
        depth: 75,
        humanEdge: 90,
        overall: 82.5
      },
      feedback: ['Great response!'],
      strengths: ['Unique perspective', 'Clear reasoning'],
      improvements: ['Could provide more examples'],
      comparison: {
        userScore: 82.5,
        rivalScore: 78,
        advantage: 'user',
        advantageReason: 'More creative approach'
      }
    };
  }

  protected override getNextRoute(): string {
    return '/round2';
  }
}
