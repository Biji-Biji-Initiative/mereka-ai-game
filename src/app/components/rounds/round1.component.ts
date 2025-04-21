import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { GameService } from '../../services/game.service';
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
    private gameService: GameService
  ) {
    super(router);
    this.roundNumber = 1;
  }

  protected override async loadChallenge(): Promise<void> {
    try {
      const challenge = await this.gameService.generateChallenge(1);
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

    const aiResponse = await this.gameService.generateAIResponse(this.challenge.id);

    await this.gameService.submitResponse({
      challengeId: this.challenge.id,
      response: this.userResponse,
      round: 1,
      aiResponse
    });
  }

  protected override async evaluateResponse(): Promise<void> {
    if (!this.challenge?.id) return;

    const evaluation = await this.gameService.evaluateResponse(
      1,
      this.userResponse,
      this.challenge.id
    );

    this.evaluation = evaluation;
  }
}
