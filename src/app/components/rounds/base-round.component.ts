import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface RoundMetrics {
    creativity: number;
    practicality: number;
    depth: number;
    humanEdge: number;
    overall: number;
    [key: string]: number; // Add index signature to allow string indexing
}

export interface RoundEvaluation {
    metrics: RoundMetrics;
    feedback: string[];
    strengths: string[];
    improvements: string[];
    comparison: {
        userScore: number;
        rivalScore: number;
        advantage: 'user' | 'rival' | 'tie';
        advantageReason: string;
    };
    badges?: string[];
}

export interface RoundChallenge {
    id: string;
    title: string;
    description: string;
    aiResponse?: string;
    steps: string[];
}

@Component({
    selector: 'app-base-round',
    templateUrl: './base-round.component.html',
    styleUrls: ['./base-round.component.scss'],
    standalone: true,
    imports: [FormsModule, CommonModule]
})
export class BaseRoundComponent implements OnInit {
    @Input() roundNumber!: number;

    isLoading = true;
    isSubmitting = false;
    showAiThinking = false;
    showEvaluation = false;
    userResponse = '';
    evaluation: RoundEvaluation | null = null;
    challenge: RoundChallenge | null = null;
    timeRemaining = 300; // 5 minutes in seconds
    progress = 0;

    constructor(protected router: Router) { }

    ngOnInit() {
        this.loadChallenge();
        this.startTimer();
    }

    protected async loadChallenge(): Promise<void> {
        // To be implemented by child classes
    }

    protected async handleSubmit(): Promise<void> {
        if (!this.userResponse.trim() || !this.challenge?.id) {
            return;
        }

        this.isSubmitting = true;
        this.showAiThinking = true;

        try {
            await this.submitResponse();
            await this.evaluateResponse();

            setTimeout(() => {
                this.showAiThinking = false;
                this.showEvaluation = true;
            }, 2000);
        } catch (error) {
            console.error('Error submitting response:', error);
            this.showAiThinking = false;
        } finally {
            this.isSubmitting = false;
        }
    }

    protected async submitResponse(): Promise<void> {
        // To be implemented by child classes
    }

    protected async evaluateResponse(): Promise<void> {
        // To be implemented by child classes
    }

    protected handleContinue(): void {
        this.showEvaluation = false;
        const nextRoute = this.getNextRoute();
        if (nextRoute) {
            this.router.navigate([nextRoute]);
        }
    }

    protected getNextRoute(): string {
        switch (this.roundNumber) {
            case 1:
                return '/round2';
            case 2:
                return '/round3';
            case 3:
                return '/results';
            default:
                return '/';
        }
    }

    private startTimer(): void {
        const timer = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.progress = ((300 - this.timeRemaining) / 300) * 100;
            } else {
                clearInterval(timer);
                this.handleTimeUp();
            }
        }, 1000);
    }

    private handleTimeUp(): void {
        this.isSubmitting = true;
        this.showAiThinking = true;

        // Auto-submit with time expired status
        this.submitResponse().then(() => {
            this.showAiThinking = false;
            this.handleContinue();
        });
    }

    protected getFormattedTime(): string {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
