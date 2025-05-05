import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionnaireComponent, Question } from '../../components/questionnaire/questionnaire.component';
import { TraitsService, TraitsData, TraitAnswer } from '../../services/traits.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-traits',
  standalone: true,
  imports: [CommonModule, QuestionnaireComponent],
  templateUrl: './traits.component.html',
  styleUrl: './traits.component.scss'
})
export class TraitsComponent implements OnInit {
  currentQuestionIndex = 0;
  answers: (number | null)[] = [];
  isSubmitting = false;
  isLoading = true;

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
    private route: ActivatedRoute,
    private traitsService: TraitsService,
    private userService: UserService
  ) {
    this.answers = new Array(this.questions.length).fill(null);
  }

  async ngOnInit() {
    // Check if user exists
    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/context']);
      return;
    }

    try {
      // Load saved traits data
      const savedTraits = await this.traitsService.getTraits(userId);
      if (savedTraits && savedTraits.answers) {
        // Map saved answers to the current questions
        this.answers = this.questions.map(question => {
          const savedAnswer = savedTraits.answers.find(a => a.questionId === question.id);
          return savedAnswer ? savedAnswer.answer : null;
        });
      }
    } catch (error) {
      console.error('Error loading saved traits:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onAnswerChange(answer: number) {
    this.answers[this.currentQuestionIndex] = answer;
  }

  async onNextQuestion() {
    if (this.isSubmitting) return;

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.isSubmitting = true;
      try {
        const userId = this.userService.getCurrentUserId();
        if (!userId) {
          this.router.navigate(['/context']);
          return;
        }

        // Save traits data
        const traitsData: TraitsData = {
          answers: this.answers
            .map((answer, index) => ({
              questionId: this.questions[index].id,
              answer
            }))
            .filter(item => item.answer !== null) as TraitAnswer[],
          questions: this.questions
        };

        await this.traitsService.saveTraits(userId, traitsData);

        // Navigate to next route
        const nextRoute = this.route.snapshot.data['next'];
        this.router.navigate(['/' + nextRoute]);
      } catch (error) {
        console.error('Error saving traits data:', error);
        // Handle error appropriately
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  onPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
}
