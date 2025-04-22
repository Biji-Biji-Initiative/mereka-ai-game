import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { ChallengeService, ChallengeResponse } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    private userService: UserService
  ) {
    super(router);
    this.roundNumber = 1;
  }

  protected override async loadChallenge(): Promise<void> {
    try {
      const challenge = await this.challengeService.generateChallenge(1);
      this.challenge = {
        id: challenge.id,
        title: 'Pattern Recognition',
        description: challenge.description,
        steps: [
          'Analyze the given patterns',
          'Identify the outlier',
          'Explain your reasoning'
        ]
      };
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading challenge:', error);
      this.router.navigate(['/focus']);
    }
  }

  protected override async submitResponse(): Promise<void> {
    if (!this.challenge?.id) return;

    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/context']);
      return;
    }

    const aiResponse = await this.challengeService.generateAIResponse(this.challenge.id);

    const challengeResponse: ChallengeResponse = {
      challengeId: this.challenge.id,
      response: this.userResponse,
      aiResponse
    };

    await this.challengeService.saveRoundResponse(userId, 1, challengeResponse);
  }

  protected override async evaluateResponse(): Promise<void> {
    if (!this.challenge?.id) return;

    const evaluation = await this.challengeService.evaluateResponse(
      1,
      this.userResponse,
      this.challenge.id
    );

    this.evaluation = evaluation;
  }
}
