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
          <p class="ml-4 text-gray-600">Generating your certificate...</p>
        </div>

        <!-- Certificate Container -->
        <div *ngIf="!loading && certificateUrl" class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Your Achievement Certificate</h1>
            <p class="text-lg text-gray-600 mb-8">Share your accomplishment with others!</p>

            <div class="flex justify-center mb-8">
              <img [src]="certificateUrl" alt="Certificate" class="rounded-lg shadow-lg max-w-full h-auto" style="max-width: 512px;" />
            </div>

            <!-- Share Buttons -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button (click)="shareOnTwitter()"
                class="flex items-center justify-center space-x-2 bg-[#1DA1F2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1a8cd8] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Share on Twitter</span>
              </button>

              <button (click)="shareOnLinkedIn()"
                class="flex items-center justify-center space-x-2 bg-[#0A66C2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#094ea3] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Share on LinkedIn</span>
              </button>

              <button (click)="downloadCertificate()"
                class="flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <span>Download Certificate</span>
              </button>

              <button [routerLink]="['/results', challengeId]"
                class="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span>Back to Results</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && !certificateUrl" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Unable to Load Certificate</h2>
          <p class="text-gray-600 mb-6">We couldn't load your certificate. Would you like to generate a new one?</p>
          <button (click)="generateCertificate()"
            class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Generate Certificate
          </button>
        </div>
      </div>
    </div>
  `
})
export class ShareComponent implements OnInit {
  certificateUrl: string | null = null;
  loading = true;
  private userId: string | null = null;
  challengeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private certificateService: CertificateService
  ) { }

  ngOnInit() {
    this.userId = this.userService.getCurrentUserId();
    this.challengeId = this.route.snapshot.paramMap.get('challengeId');

    if (!this.userId || !this.challengeId) {
      this.router.navigate(['/']);
      return;
    }

    this.loadCertificate();
  }

  private loadCertificate() {
    this.loading = true;
    this.certificateService.getCertificateUrl(this.userId!, this.challengeId!)
      .subscribe({
        next: (url) => {
          this.certificateUrl = url;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading certificate:', error);
          this.loading = false;
        }
      });
  }

  generateCertificate() {
    if (!this.userId || !this.challengeId) return;

    this.loading = true;
    this.certificateService.generateCertificate(this.userId, this.challengeId)
      .subscribe({
        next: (url) => {
          this.certificateUrl = url;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error generating certificate:', error);
          this.loading = false;
        }
      });
  }

  shareOnTwitter() {
    if (!this.certificateUrl) return;
    const text = encodeURIComponent('Check out my achievement certificate!');
    const url = encodeURIComponent(this.certificateUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  shareOnLinkedIn() {
    if (!this.certificateUrl) return;
    const text = encodeURIComponent('Check out my achievement certificate!');
    const url = encodeURIComponent(this.certificateUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  downloadCertificate() {
    if (!this.certificateUrl) return;
    const link = document.createElement('a');
    link.href = this.certificateUrl;
    link.download = 'achievement-certificate.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
