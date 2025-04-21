import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FocusArea } from '../../models/focus.interface';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss'
})
export class FocusComponent {
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
    private route: ActivatedRoute
  ) { }

  selectFocusArea(focusArea: FocusArea) {
    this.selectedFocusArea = focusArea;
  }

  onContinue() {
    if (this.selectedFocusArea) {
      // Save focus area selection here if needed
      const nextRoute = this.route.snapshot.data['next'];
      this.router.navigate(['/' + nextRoute]);
    }
  }

  onBack() {
    const previousRoute = this.route.snapshot.data['previous'];
    this.router.navigate(['/' + previousRoute]);
  }
}
