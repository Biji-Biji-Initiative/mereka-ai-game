import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ResultsAnalysisService, FinalResults } from '../../services/results-analysis.service';
import { ActivatedRoute } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';

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
    private route: ActivatedRoute,
    private router: Router,
    private challengeService: ChallengeService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      this.error = true;
      this.loading = false;
      return;
    }

    try {
      // Get the current challenge
      const challenge = await this.challengeService.getChallenge(userId);
      if (!challenge) {
        this.error = true;
        this.loading = false;
        return;
      }

      // Mark the challenge as completed
      await this.challengeService.updateChallengeStatus(challenge.id, 'completed');

      // Load and analyze results
      this.loadResults(userId, challenge.id);
    } catch (error) {
      console.error('Error in results initialization:', error);
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
          this.updateRoundsArray();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading results:', err);
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

    const roundKeys = Object.keys(this.results.rounds) as RoundKey[];
    this.rounds = roundKeys.sort((a, b) => {
      const aNum = parseInt(a.replace('round', ''));
      const bNum = parseInt(b.replace('round', ''));
      return aNum - bNum;
    });
  }

  onContinue() {
    // Navigate to dashboard since the challenge is completed
    this.router.navigate(['/dashboard']);
  }
}
