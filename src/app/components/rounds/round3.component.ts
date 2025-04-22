import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { ChallengeService, ChallengeResponse } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(
    protected override router: Router,
    private challengeService: ChallengeService,
    private userService: UserService
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
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading challenge:', error);
      this.router.navigate(['/round2']);
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

    await this.challengeService.saveRoundResponse(userId, 3, challengeResponse);
  }

  protected override async evaluateResponse(): Promise<void> {
    if (!this.challenge?.id) return;

    const evaluation = await this.challengeService.evaluateResponse(
      3,
      this.userResponse,
      this.challenge.id
    );

    this.evaluation = evaluation;
  }

  protected override handleContinue(): void {
    this.showEvaluation = false;
    this.router.navigate(['/results']);
  }
}
