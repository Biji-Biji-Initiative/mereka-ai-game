import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { RoundData } from '../../models/challenge.model';

@Component({
  selector: 'app-dynamic-round',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div class="relative py-3 sm:max-w-xl sm:mx-auto">
        <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div class="max-w-md mx-auto">
            <div class="divide-y divide-gray-200">
              <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div *ngIf="currentRound" class="mb-8">
                  <h2 class="text-2xl font-bold mb-4">Round {{roundNumber}}</h2>
                  <div class="mb-4">
                    <p class="font-semibold">Question:</p>
                    <p class="mt-2">{{currentRound.question}}</p>
                  </div>
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Your Answer:</label>
                    <textarea
                      [(ngModel)]="userResponse"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows="4"
                      placeholder="Type your answer here...">
                    </textarea>
                  </div>
                  <div class="flex justify-end space-x-4">
                    <button
                      (click)="submitResponse()"
                      [disabled]="!userResponse || isSubmitting"
                      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DynamicRoundComponent implements OnInit {
  currentRound: RoundData | null = null;
  userResponse: string = '';
  isSubmitting: boolean = false;
  roundNumber: number = 1;

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadCurrentRound();
  }

  private async loadCurrentRound() {
    try {
      const challengeId = localStorage.getItem('currentChallengeId');
      if (!challengeId) {
        this.router.navigate(['/focus']);
        return;
      }

      const challenge = await this.challengeService.getChallenge(challengeId);
      if (challenge) {
        this.roundNumber = challenge.currentRound;
        this.currentRound = challenge.rounds[this.roundNumber - 1];
      }
    } catch (error) {
      console.error('Error loading round:', error);
    }
  }

  async submitResponse() {
    if (!this.currentRound || !this.userResponse) return;

    this.isSubmitting = true;
    try {
      const challengeId = localStorage.getItem('currentChallengeId');
      if (!challengeId) {
        throw new Error('No challenge ID found');
      }

      await this.challengeService.submitResponse(challengeId, this.userResponse);

      // Move to next round or complete the challenge
      if (this.roundNumber < 3) {
        this.roundNumber++;
        await this.challengeService.setCurrentRound(this.roundNumber);
        await this.loadCurrentRound();
        this.userResponse = '';
      } else {
        this.router.navigate(['/complete']);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
