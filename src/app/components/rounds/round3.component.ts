import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { ChallengeService, ChallengeResponse, RoundData } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-round3',
  templateUrl: './base-round.component.html',
  styleUrls: ['./round3.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class Round3Component extends BaseRoundComponent {
  round1Response: string = '';
  round2Response: string = '';
  override showAiThinking = false;
  override showEvaluation = false;

  constructor(
    protected override router: Router,
    private challengeService: ChallengeService,
    private userService: UserService,
    private loadingService: LoadingService
  ) {
    super(router);
    this.roundNumber = 3;
  }

  override ngOnInit() {
    // Check if previous rounds are completed
    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/context']);
      return;
    }

    Promise.all([
      this.challengeService.getRoundResponse(userId, 1),
      this.challengeService.getRoundResponse(userId, 2)
    ]).then(([round1Data, round2Data]) => {
      if (!round1Data?.response || !round2Data?.response) {
        this.router.navigate([!round1Data?.response ? '/round1' : '/round2']);
        return;
      }
      this.round1Response = round1Data.response;
      this.round2Response = round2Data.response;
    });

    super.ngOnInit();
  }

  protected override async loadChallenge(): Promise<void> {
    try {
      const challenge = await this.challengeService.generateChallenge(3);

      if (!challenge || !challenge.id) {
        // Use dummy data if challenge is null or has no ID
        this.challenge = {
          id: 'dummy-challenge-3',
          title: 'Round 3: Ethical Analysis',
          description: 'Consider the ethical implications of your proposed solutions from Rounds 1 and 2. How do they balance efficiency with human values? What potential ethical concerns might arise?',
          steps: [
            'Review previous solutions',
            'Analyze ethical implications',
            'Propose balanced approaches'
          ]
        };
      } else {
        this.challenge = {
          id: challenge.id,
          title: 'Ethical Analysis',
          description: challenge.description,
          steps: [
            'Review previous solutions',
            'Analyze ethical implications',
            'Propose balanced approaches'
          ]
        };
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Error loading challenge:', error);
      // Use dummy data on error
      this.challenge = {
        id: 'dummy-challenge-3',
        title: 'Round 3: Ethical Analysis',
        description: 'Consider the ethical implications of your proposed solutions from Rounds 1 and 2. How do they balance efficiency with human values? What potential ethical concerns might arise?',
        steps: [
          'Review previous solutions',
          'Analyze ethical implications',
          'Propose balanced approaches'
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
        3,
        this.userResponse,
        this.challenge.id
      );

      // Create round data with the new structure
      const roundData: RoundData = {
        roundNumber: 3,
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
      await this.challengeService.saveRoundResponse(userId, 3, challengeResponse);

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

  protected override handleContinue(): void {
    this.showEvaluation = false;
    this.router.navigate(['/results']);
  }
}
