import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionnaireComponent, Question } from '../../components/questionnaire/questionnaire.component';
import { UserService } from '../../services/user.service';
import { AttitudesData, AttitudeAnswer } from '../../models/user.model';

@Component({
  selector: 'app-attitudes',
  standalone: true,
  imports: [CommonModule, QuestionnaireComponent],
  templateUrl: './attitudes.component.html',
  styleUrl: './attitudes.component.scss'
})
export class AttitudesComponent implements OnInit {
  currentQuestionIndex = 0;
  answers: (number | null)[] = [];
  isSubmitting = false;
  isLoading = true;

  questions: Question[] = [
    {
      id: 1,
      title: 'How do you feel about working with AI?',
      subtitle: 'AI Attitude Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Very uncomfortable',
        maxLabel: 'Very comfortable'
      },
      about: {
        title: 'About AI collaboration',
        description: 'Your comfort level with AI-assisted work environments.'
      }
    },
    {
      id: 2,
      title: 'How do you view the role of AI in decision-making?',
      subtitle: 'Decision-making Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Supportive role only',
        maxLabel: 'Equal partnership'
      },
      about: {
        title: 'About AI decision-making',
        description: 'Your perspective on AI\'s role in decision-making processes.'
      }
    },
    {
      id: 3,
      title: 'How do you feel about AI replacing human tasks?',
      subtitle: 'Task Automation Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Very concerned',
        maxLabel: 'Very optimistic'
      },
      about: {
        title: 'About task automation',
        description: 'Your attitude towards AI automating human tasks.'
      }
    },
    {
      id: 4,
      title: 'How do you view AI in terms of ethics?',
      subtitle: 'Ethical Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Major concerns',
        maxLabel: 'Minor concerns'
      },
      about: {
        title: 'About AI ethics',
        description: 'Your perspective on ethical considerations in AI.'
      }
    },
    {
      id: 5,
      title: 'How do you feel about AI learning from human behavior?',
      subtitle: 'Learning Assessment',
      type: 'rating',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Very cautious',
        maxLabel: 'Very supportive'
      },
      about: {
        title: 'About AI learning',
        description: 'Your attitude towards AI learning from human behavior.'
      }
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
      // Load saved attitudes data
      const savedAttitudes = await this.userService.getUserAttitudes(userId);
      if (savedAttitudes && savedAttitudes.answers) {
        // Map saved answers to the current questions
        this.answers = this.questions.map(question => {
          const savedAnswer = savedAttitudes.answers.find((a: AttitudeAnswer) => a.questionId === question.id);
          return savedAnswer ? savedAnswer.answer : null;
        });
      }
    } catch (error) {
      console.error('Error loading saved attitudes:', error);
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

        // Save attitudes data
        const attitudesData: AttitudesData = {
          answers: this.answers
            .map((answer, index) => ({
              questionId: this.questions[index].id,
              answer
            }))
            .filter(item => item.answer !== null) as AttitudeAnswer[],
          questions: this.questions
        };

        await this.userService.updateUserAttitudes(userId, attitudesData);

        // Navigate to next route
        const nextRoute = this.route.snapshot.data['next'];
        this.router.navigate(['/' + nextRoute]);
      } catch (error) {
        console.error('Error saving attitudes data:', error);
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
