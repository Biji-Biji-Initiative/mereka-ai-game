import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { ChallengeService, ChallengeResponse, RoundData } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-round2',
  templateUrl: './base-round.component.html',
  styleUrls: ['./round2.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class Round2Component extends BaseRoundComponent {
  round1Response: string = '';
  override showAiThinking = false;
  override showEvaluation = false;

  constructor(
    protected override router: Router,
    private challengeService: ChallengeService,
    private userService: UserService,
    private loadingService: LoadingService
  ) {
    super(router);
    this.roundNumber = 2;
  }

  override ngOnInit() {
    // Check if round 1 is completed
    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/context']);
      return;
    }

    this.challengeService.getRoundResponse(userId, 1).then(round1Data => {
      if (!round1Data?.response) {
        this.router.navigate(['/round1']);
        return;
      }
      this.round1Response = round1Data.response;
    });

    super.ngOnInit();
  }

  protected override async loadChallenge(): Promise<void> {
    try {
      const challenge = await this.challengeService.generateChallenge(2);

      if (!challenge || !challenge.id) {
        // Use dummy data if challenge is null or has no ID
        this.challenge = {
          id: 'dummy-challenge-2',
          title: 'Round 2: Building on Round 1',
          description: 'Based on your Round 1 solution, how would you enhance it to make it even better? Consider areas for improvement and propose an enhanced solution.',
          steps: [
            'Review your Round 1 solution',
            'Identify areas for improvement',
            'Propose an enhanced solution'
          ]
        };
      } else {
        this.challenge = {
          id: challenge.id,
          title: 'Building on Round 1',
          description: challenge.description,
          steps: [
            'Review your Round 1 solution',
            'Identify areas for improvement',
            'Propose an enhanced solution'
          ]
        };
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Error loading challenge:', error);
      // Use dummy data on error
      this.challenge = {
        id: 'dummy-challenge-2',
        title: 'Round 2: Building on Round 1',
        description: 'Based on your Round 1 solution, how would you enhance it to make it even better? Consider areas for improvement and propose an enhanced solution.',
        steps: [
          'Review your Round 1 solution',
          'Identify areas for improvement',
          'Propose an enhanced solution'
        ]
      };
      this.isLoading = false;
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
      const evaluation = await this.challengeService.evaluateResponse(
        2,
        this.userResponse,
        this.challenge.id
      );

      // Create round data with the new structure
      const roundData: RoundData = {
        roundNumber: 2,
        question: this.challenge.description,
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
        question: this.challenge.description
      };

      // Save the response to the database
      await this.challengeService.saveRoundResponse(userId, 2, challengeResponse);

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
