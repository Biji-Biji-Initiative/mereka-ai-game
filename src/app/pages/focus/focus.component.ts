import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FocusArea } from '../../services/focus-area-generator.service';
import { ChallengeService } from '../../services/challenge.service';
import { LoadingService } from '../../services/loading.service';
import { RoundGeneratorService } from '../../services/round-generator.service';
import { FocusAreaGeneratorService } from '../../services/focus-area-generator.service';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss'
})
export class FocusComponent implements OnInit {
  selectedFocusArea: FocusArea | null = null;
  focusAreas: FocusArea[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private loadingService: LoadingService,
    private roundGeneratorService: RoundGeneratorService,
    private focusAreaGeneratorService: FocusAreaGeneratorService
  ) { }

  ngOnInit(): void {
    this.generateFocusAreas();
  }

  async generateFocusAreas() {
    this.isLoading = true;
    this.error = null;
    try {
      this.focusAreas = await this.focusAreaGeneratorService.generateFocusAreas();
    } catch (err) {
      this.error = 'Failed to generate focus areas. Please try again.';
      console.error('Error generating focus areas:', err);
    } finally {
      this.isLoading = false;
    }
  }

  selectFocusArea(area: FocusArea) {
    this.selectedFocusArea = area;
  }

  async onContinue() {
    if (!this.selectedFocusArea) return;

    try {
      const challengeId = await this.challengeService.createChallenge({
        focusArea: this.selectedFocusArea.name,
        description: this.selectedFocusArea.description
      });
      await this.router.navigate(['/round', challengeId, 1]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      this.error = 'Failed to create challenge. Please try again.';
    }
  }

  onBack() {
    const previousRoute = this.route.snapshot.data['previous'];
    this.router.navigate([`/${previousRoute}`]);
  }
}
