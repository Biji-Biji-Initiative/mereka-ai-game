import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <!-- Share Card -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Share Your Results</h1>
            <p class="text-lg text-gray-600 mb-8">Share your AI Fight Club performance with others!</p>

            <!-- Score Display -->
            <div class="bg-indigo-50 rounded-lg p-6 mb-8">
              <div class="text-5xl font-bold text-indigo-600 mb-2">{{ results?.overallScore ?? 0 }}%</div>
              <p class="text-xl text-gray-600">Overall Score</p>
            </div>

            <!-- Share Options -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button (click)="shareOnTwitter()" class="flex items-center justify-center space-x-2 bg-[#1DA1F2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1a8cd8] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Share on Twitter</span>
              </button>

              <button (click)="shareOnLinkedIn()" class="flex items-center justify-center space-x-2 bg-[#0A66C2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#094ea3] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Share on LinkedIn</span>
              </button>
            </div>

            <!-- Copy Link -->
            <div class="mb-8">
              <div class="flex items-center space-x-2">
                <input type="text" [value]="shareUrl" readonly class="flex-1 p-3 border rounded-lg bg-gray-50" />
                <button (click)="copyToClipboard()" class="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Copy Link
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center space-x-4">
              <button routerLink="/results" class="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Back to Results
              </button>
              <button routerLink="/" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Start New Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ShareComponent implements OnInit {
  results: any;
  shareUrl: string = '';

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.results = this.gameService.getResults();
    this.shareUrl = window.location.href;
  }

  shareOnTwitter() {
    const text = `I scored ${this.results?.overallScore}% in the AI Fight Club! Can you beat my score?`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.shareUrl)}`;
    window.open(url, '_blank');
  }

  shareOnLinkedIn() {
    const text = `I scored ${this.results?.overallScore}% in the AI Fight Club! Can you beat my score?`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}`;
    window.open(url, '_blank');
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
