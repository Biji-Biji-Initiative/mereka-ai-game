import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent, RoundChallenge } from './base-round.component';
import { ChallengeService, RoundData, ChallengeResponse } from '../../services/challenge.service';
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
    try {
      this.loadingService.show();
      // Get challenge ID from localStorage
      const challengeId = localStorage.getItem('mereka_challenge_id');

      if (!challengeId) {
        this.router.navigate(['/focus']);
        return;
      }

      // Get challenge data
      const challenge = await this.challengeService.getChallenge(challengeId);

      if (!challenge) {
        this.router.navigate(['/focus']);
        return;
      }

      // Set up round 1 challenge
      this.challenge = {
        id: challengeId,
        title: 'Round 1: Initial Challenge',
        description: challenge.description || 'How would you solve this problem?',
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

  protected override async submitResponse(): Promise<void> {
    if (!this.challenge?.id || !this.userResponse) return;

    try {
      this.loadingService.show();
      this.showAiThinking = true;
      const userId = this.userService.getCurrentUserId();
      if (!userId) {
        this.router.navigate(['/context']);
        return;
      }

      // First, generate AI response
      const aiResponse = await this.challengeService.generateAIResponse(this.challenge.id);

      // Then, evaluate the response
      const evaluation = await this.challengeService.evaluateResponse(1, this.userResponse, this.challenge.id);

      // Create round data with the new structure
      const roundData: RoundData = {
        roundNumber: 1,
        question: this.challenge.description || 'How would you solve this problem?',
        answer: this.userResponse,
        result: {
          aiResponse: aiResponse || '',
          evaluation: evaluation || null
        }
      };

      // Save the round data to the challenge
      await this.challengeService.addRound(this.challenge.id, roundData);

      // Save the complete response with AI analysis and evaluation
      const challengeResponse: ChallengeResponse = {
        challengeId: this.challenge.id,
        response: this.userResponse,
        aiResponse: aiResponse || '',
        evaluation: evaluation || null,
        question: this.challenge.description || 'How would you solve this problem?'
      };

      // Save the response to the database
      await this.challengeService.saveRoundResponse(userId, 1, challengeResponse);

      // Set the evaluation to show in the UI
      this.evaluation = evaluation;

      // Hide AI thinking and show evaluation
      this.showAiThinking = false;
      this.showEvaluation = true;

    } catch (error) {
      console.error('Error submitting round:', error);
      this.showAiThinking = false;
      // Error will be shown in the UI through the loading state
    } finally {
      this.loadingService.hide();
    }
  }

  protected override async evaluateResponse(): Promise<void> {
    // This method is now handled within submitResponse
    // We don't need to evaluate separately anymore
  }
}
