import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionnaireComponent, Question } from '../../components/questionnaire/questionnaire.component';

@Component({
  selector: 'app-attitudes',
  standalone: true,
  imports: [CommonModule, QuestionnaireComponent],
  templateUrl: './attitudes.component.html',
  styleUrl: './attitudes.component.scss'
})
export class AttitudesComponent {
  currentQuestionIndex = 0;
  answers: number[] = [];

  questions: Question[] = [
    {
      id: 1,
      title: 'How much do you trust AI systems with important tasks?',
      subtitle: 'AI Trust Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Highly skeptical',
        maxLabel: 'Completely trust'
      },
      about: {
        title: 'About AI Trust',
        description: 'Your level of confidence in AI\'s reliability and safety.'
      }
    },
    {
      id: 2,
      title: 'How concerned are you about AI\'s impact on jobs?',
      subtitle: 'AI Impact Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Not concerned',
        maxLabel: 'Extremely concerned'
      },
      about: {
        title: 'About AI Impact',
        description: 'Your level of worry about AI replacing human roles.'
      }
    },
    {
      id: 3,
      title: 'How much do you believe AI will improve humanity\'s future?',
      subtitle: 'AI Optimism Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Pessimistic',
        maxLabel: 'Very optimistic'
      },
      about: {
        title: 'About AI Optimism',
        description: 'Your optimism about AI\'s positive effects on society.'
      }
    },
    {
      id: 4,
      title: 'How comfortable are you working with AI tools?',
      subtitle: 'AI Collaboration Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Uncomfortable',
        maxLabel: 'Very comfortable'
      },
      about: {
        title: 'About AI Collaboration',
        description: 'Your openness to collaborating with AI in your work.'
      }
    },
    {
      id: 5,
      title: 'How much autonomy should AI systems have?',
      subtitle: 'AI Autonomy Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Always human oversight',
        maxLabel: 'Full autonomy when appropriate'
      },
      about: {
        title: 'About AI Autonomy',
        description: 'Your view on AI\'s independence in decision-making.'
      }
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.answers = new Array(this.questions.length).fill(null);
  }

  onAnswerChange(answer: number) {
    this.answers[this.currentQuestionIndex] = answer;
  }

  onNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      // Save attitudes data here if needed
      const nextRoute = this.route.snapshot.data['next'];
      this.router.navigate(['/' + nextRoute]);
    }
  }

  onPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
}
