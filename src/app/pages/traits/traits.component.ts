import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionnaireComponent, Question } from '../../components/questionnaire/questionnaire.component';

@Component({
  selector: 'app-traits',
  standalone: true,
  imports: [CommonModule, QuestionnaireComponent],
  templateUrl: './traits.component.html',
  styleUrl: './traits.component.scss'
})
export class TraitsComponent {
  currentQuestionIndex = 0;
  answers: number[] = [];

  questions: Question[] = [
    {
      id: 1,
      title: 'How creative do you consider yourself to be?',
      subtitle: 'Creativity Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Not creative',
        maxLabel: 'Highly creative'
      },
      about: {
        title: 'About creativity',
        description: 'Your ability to generate novel ideas and solutions.'
      }
    },
    {
      id: 2,
      title: 'How empathetic are you toward others?',
      subtitle: 'Empathy Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Not empathetic',
        maxLabel: 'Highly empathetic'
      },
      about: {
        title: 'About empathy',
        description: 'Your ability to understand and share the feelings of others.'
      }
    },
    {
      id: 3,
      title: 'How analytical is your thinking style?',
      subtitle: 'Analytical Thinking Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Not analytical',
        maxLabel: 'Highly analytical'
      },
      about: {
        title: 'About analytical thinking',
        description: 'Your tendency to break down complex problems into components.'
      }
    },
    {
      id: 4,
      title: 'How adaptable are you to new situations?',
      subtitle: 'Adaptability Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Not adaptable',
        maxLabel: 'Highly adaptable'
      },
      about: {
        title: 'About adaptability',
        description: 'Your ability to adjust to new conditions or environments.'
      }
    },
    {
      id: 5,
      title: 'How would you rate your communication skills?',
      subtitle: 'Communication Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Basic',
        maxLabel: 'Advanced'
      },
      about: {
        title: 'About communication',
        description: 'Your ability to convey ideas clearly and effectively.'
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
      // Save traits data here if needed
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
