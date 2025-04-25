import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FocusArea } from '../../models/focus.interface';
import { ChallengeService, FocusData } from '../../services/challenge.service';
import { NavigationService } from '../../services/navigation.service';
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
  focusAreas: FocusArea[] = [
    {
      id: 'creative',
      name: 'Creative Thinking',
      description: 'Test your creative problem-solving abilities against AI systems.',
      matchLevel: 85,
      icon: '🎨',
      color: 'var(--ai-purple)'
    },
    {
      id: 'analytical',
      name: 'Analytical Reasoning',
      description: 'Challenge your logical and analytical skills in AI-driven scenarios.',
      matchLevel: 90,
      icon: '🧠',
      color: 'var(--ai-blue)'
    },
    {
      id: 'emotional',
      name: 'Emotional Intelligence',
      description: 'Explore how your emotional intelligence compares to AI capabilities.',
      matchLevel: 75,
      icon: '❤️',
      color: 'var(--ai-red)'
    },
    {
      id: 'ethical',
      name: 'Ethical Decision Making',
      description: 'Navigate complex ethical dilemmas that test both human and AI judgment.',
      matchLevel: 80,
      icon: '⚖️',
      color: 'var(--ai-green)'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private navigationService: NavigationService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    // Set default focus area
    this.selectedFocusArea = this.focusAreas[0];
  }

  selectFocusArea(focusArea: FocusArea) {
    this.selectedFocusArea = focusArea;
  }

  async onContinue(): Promise<void> {
    if (!this.selectedFocusArea) return;

    try {
      this.loadingService.show();
      console.log('Creating challenge for focus area:', this.selectedFocusArea.id);

      const focusData: FocusData = {
        focusArea: this.selectedFocusArea.id,
        description: this.selectedFocusArea.description
      };

      const challengeId = await this.challengeService.createChallenge(focusData);
      console.log('Challenge created with ID:', challengeId);
      localStorage.setItem('currentChallengeId', challengeId);

      // Navigate to the first round
      console.log('Navigating to round 1');
      this.router.navigate(['/round', 1]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      this.loadingService.hide();
    }
  }

  onBack() {
    const previousRoute = this.route.snapshot.data['previous'];
    this.navigationService.navigateToPreviousRoute('focus', previousRoute);
  }
}
