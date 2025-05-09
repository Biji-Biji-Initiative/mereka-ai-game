import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 class="text-2xl font-bold text-red-800 mb-4">Unable to Load Certificate</h2>
          <p class="text-red-600 mb-6">{{ error }}</p>
          <button routerLink="/dashboard"
            class="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
            Return to Dashboard
          </button>
        </div>

        <!-- Certificate Card -->
        <div *ngIf="!loading && !error && certificateUrl" class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Your AI-Generated Certificate</h1>
            <p class="text-lg text-gray-600 mb-8">Share your achievement with others!</p>
            <div class="flex justify-center mb-8">
              <img [src]="certificateUrl" alt="Certificate" class="rounded-lg shadow-lg max-w-full h-auto" style="max-width: 512px;" />
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

              <button (click)="shareOnFacebook()" class="flex items-center justify-center space-x-2 bg-[#1877F2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#166fe5] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Share on Facebook</span>
              </button>

              <button (click)="shareOnWhatsApp()" class="flex items-center justify-center space-x-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Share on WhatsApp</span>
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
              <p *ngIf="copySuccess" class="text-green-600 mt-2">Link copied to clipboard!</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center space-x-4">
              <button [routerLink]="['/results', challengeId]" class="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Back to Results
              </button>
              <button routerLink="/focus" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
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
  certificateUrl: string | null = null;
  loading = true;
  error: string | null = null;
  copySuccess = false;
  shareUrl: string = '';
  challengeId: string = '';

  constructor(
    private certificateService: CertificateService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.challengeId = this.route.snapshot.paramMap.get('challengeId') || '';
    const userId = this.userService.getCurrentUserId();
    this.shareUrl = window.location.href;

    if (!userId || !this.challengeId) {
      this.error = 'Missing user or challenge ID';
      this.loading = false;
      return;
    }

    this.certificateService.getCertificateUrl(userId, this.challengeId).subscribe((url: string | null) => {
      if (url) {
        this.certificateUrl = url;
        this.loading = false;
      } else {
        const dalleParams = {
          model: 'dall-e-3',
          prompt: `Create a professional certificate for user ${userId} for challenge ${this.challengeId}. Include their achievement and make it visually appealing for sharing.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'url'
        };
        this.certificateService.generateCertificate(userId, this.challengeId, dalleParams).subscribe({
          next: (imgUrl: string) => {
            this.certificateUrl = imgUrl;
            this.loading = false;
          },
          error: (err: any) => {
            this.error = 'Failed to generate certificate';
            this.loading = false;
          }
        });
      }
    }, (err: any) => {
      this.error = 'Failed to load certificate information';
      this.loading = false;
    });
  }

  shareOnTwitter() {
    if (!this.certificateUrl) return;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.certificateUrl)}`;
    window.open(url, '_blank');
  }

  shareOnLinkedIn() {
    if (!this.certificateUrl) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.certificateUrl)}`;
    window.open(url, '_blank');
  }

  shareOnFacebook() {
    if (!this.certificateUrl) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.certificateUrl)}`;
    window.open(url, '_blank');
  }

  shareOnWhatsApp() {
    if (!this.certificateUrl) return;
    const url = `https://wa.me/?text=${encodeURIComponent(this.certificateUrl)}`;
    window.open(url, '_blank');
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
