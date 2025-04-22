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
  rounds: RoundKey[] = ['round1', 'round2', 'round3'];
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
    console.log('userId', userId);
    console.log('challengeId', challengeId);
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

    this.resultsAnalysisService.analyzeResults(userId, challengeId)
      .subscribe({
        next: (results) => {
          this.results = results;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading results:', err);
          this.error = true;
          this.loading = false;
        }
      });
  }
}
