import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FocusArea } from '../../models/focus.interface';
import { ChallengeService } from '../../services/challenge.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss'
})
export class FocusComponent implements OnInit {
  selectedFocusArea: FocusArea | null = null;
  focusAreas = [
    {
      id: 'creative',
      name: 'Creative Thinking',
      description: 'Test your creative problem-solving abilities against AI systems.',
      matchLevel: 85
    },
    {
      id: 'strategic',
      name: 'Strategic Planning',
      description: 'Challenge AI in strategic decision-making scenarios.',
      matchLevel: 75
    },
    {
      id: 'analytical',
      name: 'Analytical Reasoning',
      description: 'Compete with AI in complex analytical tasks.',
      matchLevel: 80
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    // Component initialization
  }

  selectFocusArea(area: FocusArea) {
    this.selectedFocusArea = area;
  }

  async onContinue() {
    if (!this.selectedFocusArea) return;

    this.loadingService.show();
    try {
      const nextRoute = this.route.snapshot.data['next'];
      await this.challengeService.createChallenge({
        focusArea: this.selectedFocusArea.id,
        description: this.selectedFocusArea.description
      });
      this.router.navigate([nextRoute]);
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  onBack() {
    const previousRoute = this.route.snapshot.data['previous'];
    this.router.navigate([`/${previousRoute}`]);
  }
}
