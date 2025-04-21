import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  steps = [
    { number: 1, text: 'Complete a short personality assessment to discover your AI traits' },
    { number: 2, text: 'Choose your focus area for the challenge based on your strengths' },
    { number: 3, text: 'Compete in three rounds against the AI to test your abilities' },
    { number: 4, text: 'Receive your personalized AI profile with detailed insights' },
    { number: 5, text: 'Share your results and compare with others in the community' }
  ];
}
