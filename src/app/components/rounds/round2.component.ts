import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { ChallengeService, ChallengeResponse } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-round2',
  templateUrl: './base-round.component.html',
  styleUrls: ['./round2.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class Round2Component extends BaseRoundComponent {
  round1Response: string = '';

  constructor(
    protected override router: Router,
    private challengeService: ChallengeService,
    private userService: UserService
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
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading challenge:', error);
      this.router.navigate(['/round1']);
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

    await this.challengeService.saveRoundResponse(userId, 2, challengeResponse);
  }

  protected override async evaluateResponse(): Promise<void> {
    if (!this.challenge?.id) return;

    const evaluation = await this.challengeService.evaluateResponse(
      2,
      this.userResponse,
      this.challenge.id
    );

    this.evaluation = evaluation;
  }
}
