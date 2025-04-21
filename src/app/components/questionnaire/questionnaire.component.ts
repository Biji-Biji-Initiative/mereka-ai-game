import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Question {
  id: number;
  title: string;
  subtitle: string;
  type: 'rating' | 'text' | 'multiple-choice';
  options?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  about?: {
    title: string;
    description: string;
  };
}

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.scss'
})
export class QuestionnaireComponent {
  @Input() currentQuestionIndex: number = 0;
  @Input() totalQuestions: number = 5;
  @Input() question!: Question;
  @Input() answer: any;

  @Output() answerChange = new EventEmitter<any>();
  @Output() nextQuestion = new EventEmitter<void>();
  @Output() previousQuestion = new EventEmitter<void>();

  get progressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
  }

  onAnswerChange(value: any) {
    this.answerChange.emit(value);
  }

  onNext() {
    this.nextQuestion.emit();
  }

  onPrevious() {
    this.previousQuestion.emit();
  }
}
