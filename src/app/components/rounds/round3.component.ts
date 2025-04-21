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
    aiResponse: string = '';

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
            const aiResponse = await this.gameService.generateAIResponse(challenge.id);

            this.challenge = {
                id: challenge.id,
                title: 'Ethical Dilemma',
                description: challenge.description,
                aiResponse: aiResponse,
                steps: [
                    'Evaluate the ethical implications',
                    'Consider multiple perspectives',
                    'Make a balanced decision'
                ]
            };
            this.aiResponse = aiResponse;
            this.isLoading = false;
        } catch (error) {
            console.error('Error loading challenge:', error);
            this.router.navigate(['/round2']);
        }
    }

    protected override async submitResponse(): Promise<void> {
        if (!this.challenge?.id) return;

        await this.gameService.submitResponse({
            challengeId: this.challenge.id,
            response: this.userResponse,
            round: 3,
            aiResponse: this.aiResponse
        });
    }

    protected override async evaluateResponse(): Promise<void> {
        if (!this.challenge?.id) return;

        const evaluation = await this.gameService.evaluateResponse(
            3,
            this.userResponse,
            this.challenge.description,
            this.aiResponse
        );

        // Generate profile after final round
        const profile = await this.gameService.generateProfile({
            round1Response: this.round1Response,
            round2Response: this.round2Response,
            round3Response: this.userResponse,
            finalEvaluation: evaluation
        });

        // Save profile ID
        if (profile?.id) {
            await this.gameService.saveProfileId(profile.id);
        }

        this.evaluation = {
            ...evaluation,
            badges: profile?.badges || []
        };
    }

    protected override handleContinue(): void {
        this.showEvaluation = false;
        this.router.navigate(['/results']);
    }
}
