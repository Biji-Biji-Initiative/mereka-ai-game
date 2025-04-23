import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResultsAnalysisService, FinalResults } from '../../services/results-analysis.service';
import { ActivatedRoute } from '@angular/router';

type RoundKey = 'round1' | 'round2' | 'round3';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  results?: FinalResults;
  rounds: RoundKey[] = [];
  loading = true;
  error = false;

  constructor(
    private resultsAnalysisService: ResultsAnalysisService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Get userId and challengeId from route parameters
    const userId = localStorage.getItem('mereka_user_id');
    const challengeId = localStorage.getItem('currentChallengeId');
    console.log('ResultsComponent - userId', userId);
    console.log('ResultsComponent - challengeId', challengeId);
    localStorage.removeItem('currentChallengeId');
    if (userId && challengeId) {
      this.loadResults(userId, challengeId);
    } else {
      console.log('No userId or challengeId found');
      this.error = true;
      this.loading = false;
    }
  }

  private loadResults(userId: string, challengeId: string) {
    this.loading = true;
    this.error = false;
    console.log('ResultsComponent - Loading results for userId:', userId, 'challengeId:', challengeId);
    this.resultsAnalysisService.analyzeResults(userId, challengeId)
      .subscribe({
        next: (results) => {
          console.log('ResultsComponent - Results loaded:', results);
          this.results = results;

          // Dynamically generate rounds array based on available data
          this.updateRoundsArray();

          this.loading = false;
        },
        error: (err) => {
          console.error('ResultsComponent - Error loading results:', err);
          this.error = true;
          this.loading = false;
        }
      });
  }

  private updateRoundsArray() {
    if (!this.results || !this.results.rounds) {
      this.rounds = [];
      return;
    }

    // Get all round keys from the results
    const roundKeys = Object.keys(this.results.rounds) as RoundKey[];

    // Sort the keys to ensure they're in order (round1, round2, round3, etc.)
    this.rounds = roundKeys.sort((a, b) => {
      const aNum = parseInt(a.replace('round', ''));
      const bNum = parseInt(b.replace('round', ''));
      return aNum - bNum;
    });

    console.log('ResultsComponent - Updated rounds array:', this.rounds);
  }
}
