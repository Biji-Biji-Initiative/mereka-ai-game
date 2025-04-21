import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { GameService } from '../../services/game.service';
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
    private gameService: GameService
  ) {
    super(router);
    this.roundNumber = 3;
  }

  override ngOnInit() {
    // Check if previous rounds are completed
    const round1Data = this.gameService.getRoundData(1);
    const round2Data = this.gameService.getRoundData(2);

    if (!round1Data?.response || !round2Data?.response) {
      this.router.navigate([!round1Data?.response ? '/round1' : '/round2']);
      return;
    }

    this.round1Response = round1Data.response;
    this.round2Response = round2Data.response;
    super.ngOnInit();
  }

  protected override async loadChallenge(): Promise<void> {
    try {
      const challenge = await this.gameService.generateChallenge(3);
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

    const aiResponse = await this.gameService.generateAIResponse(this.challenge.id);

    await this.gameService.submitResponse({
      challengeId: this.challenge.id,
      response: this.userResponse,
      round: 3,
      aiResponse
    });
  }

  protected override async evaluateResponse(): Promise<void> {
    if (!this.challenge?.id) return;

    const evaluation = await this.gameService.evaluateResponse(
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
