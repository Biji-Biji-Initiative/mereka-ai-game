import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    points: number;
    timeLimit: number;
    completed: boolean;
    score?: number;
}

@Component({
    selector: 'app-challenges',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Challenges</h1>
        <div class="flex space-x-4">
          <select class="border rounded-md px-3 py-2">
            <option value="all">All Categories</option>
            <option value="ethics">Ethics</option>
            <option value="creativity">Creativity</option>
            <option value="analysis">Analysis</option>
            <option value="communication">Communication</option>
          </select>
          <select class="border rounded-md px-3 py-2">
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let challenge of challenges"
             class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-semibold text-gray-900">{{ challenge.title }}</h3>
              <span [class]="getDifficultyClass(challenge.difficulty)"
                    class="px-2 py-1 text-xs font-medium rounded-full">
                {{ challenge.difficulty }}
              </span>
            </div>
            <p class="text-gray-600 mb-4">{{ challenge.description }}</p>
            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{{ challenge.category }}</span>
              <span>{{ challenge.timeLimit }} minutes</span>
              <span>{{ challenge.points }} points</span>
            </div>
            <div class="flex justify-between items-center">
              <button *ngIf="!challenge.completed"
                      (click)="startChallenge(challenge)"
                      class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200">
                Start Challenge
              </button>
              <div *ngIf="challenge.completed" class="flex items-center space-x-2">
                <span class="text-green-600 font-medium">Completed</span>
                <span class="text-gray-600">Score: {{ challenge.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChallengesComponent implements OnInit {
    challenges: Challenge[] = [
        {
            id: '1',
            title: 'Ethical Decision Making',
            description: 'Navigate complex ethical scenarios and make decisions that balance multiple stakeholders.',
            difficulty: 'Hard',
            category: 'Ethics',
            points: 100,
            timeLimit: 30,
            completed: false
        },
        {
            id: '2',
            title: 'Creative Problem Solving',
            description: 'Generate innovative solutions to open-ended problems using creative thinking techniques.',
            difficulty: 'Medium',
            category: 'Creativity',
            points: 75,
            timeLimit: 20,
            completed: true,
            score: 85
        },
        {
            id: '3',
            title: 'Data Analysis Challenge',
            description: 'Analyze complex datasets and draw meaningful insights to solve business problems.',
            difficulty: 'Hard',
            category: 'Analysis',
            points: 100,
            timeLimit: 45,
            completed: false
        },
        {
            id: '4',
            title: 'Communication Strategy',
            description: 'Develop effective communication strategies for different audiences and contexts.',
            difficulty: 'Medium',
            category: 'Communication',
            points: 75,
            timeLimit: 25,
            completed: false
        },
        {
            id: '5',
            title: 'Quick Ethics Quiz',
            description: 'Test your knowledge of ethical principles and decision-making frameworks.',
            difficulty: 'Easy',
            category: 'Ethics',
            points: 50,
            timeLimit: 15,
            completed: true,
            score: 90
        },
        {
            id: '6',
            title: 'Innovation Workshop',
            description: 'Practice creative thinking techniques to generate innovative ideas and solutions.',
            difficulty: 'Easy',
            category: 'Creativity',
            points: 50,
            timeLimit: 20,
            completed: false
        }
    ];

    constructor() { }

    ngOnInit(): void {
        // In a real app, this would fetch challenges from a service
    }

    getDifficultyClass(difficulty: string): string {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-100 text-green-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    startChallenge(challenge: Challenge): void {
        // In a real app, this would navigate to the challenge page
        console.log('Starting challenge:', challenge.id);
    }
}
