import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRoundComponent } from './base-round.component';
import { GameService } from '../../services/game.service';
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
    aiResponse: string = '';

    constructor(
        protected override router: Router,
        private gameService: GameService
    ) {
        super(router);
        this.roundNumber = 2;
    }

    override ngOnInit() {
        // Check if round 1 is completed
        const round1Data = this.gameService.getRoundData(1);
        if (!round1Data?.response) {
            this.router.navigate(['/round1']);
            return;
        }
        this.round1Response = round1Data.response;
        super.ngOnInit();
    }

    protected override async loadChallenge(): Promise<void> {
        try {
            const challenge = await this.gameService.generateChallenge(2);
            const aiResponse = await this.gameService.generateAIResponse(challenge.id);

            this.challenge = {
                id: challenge.id,
                title: 'Creative Problem Solving',
                description: challenge.description,
                aiResponse: aiResponse,
                steps: [
                    'Understand the problem constraints',
                    'Generate multiple solutions',
                    'Select the most innovative approach'
                ]
            };
            this.aiResponse = aiResponse;
            this.isLoading = false;
        } catch (error) {
            console.error('Error loading challenge:', error);
            this.router.navigate(['/round1']);
        }
    }

    protected override async submitResponse(): Promise<void> {
        if (!this.challenge?.id) return;

        await this.gameService.submitResponse({
            challengeId: this.challenge.id,
            response: this.userResponse,
            round: 2,
            aiResponse: this.aiResponse
        });
    }

    protected override async evaluateResponse(): Promise<void> {
        if (!this.challenge?.id) return;

        const evaluation = await this.gameService.evaluateResponse(
            2,
            this.userResponse,
            this.challenge.description,
            this.aiResponse
        );

        this.evaluation = evaluation;
    }
}
