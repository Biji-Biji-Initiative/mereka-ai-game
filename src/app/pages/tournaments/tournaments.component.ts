import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Tournament {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    participants: number;
    status: 'upcoming' | 'active' | 'completed';
    prize: string;
    category: string;
}

@Component({
    selector: 'app-tournaments',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Tournaments</h1>
        <button class="btn btn-primary">Create Tournament</button>
      </div>

      <!-- Tournament Filters -->
      <div class="flex gap-4 mb-6">
        <button class="btn btn-outline active">All</button>
        <button class="btn btn-outline">Upcoming</button>
        <button class="btn btn-outline">Active</button>
        <button class="btn btn-outline">Completed</button>
      </div>

      <!-- Tournaments Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let tournament of tournaments" class="card">
          <div class="card-body">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-semibold">{{ tournament.title }}</h3>
              <span [class]="'badge ' + getStatusClass(tournament.status)">
                {{ tournament.status }}
              </span>
            </div>
            <p class="text-gray-600 mb-4">{{ tournament.description }}</p>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between">
                <span class="text-gray-500">Category:</span>
                <span class="font-medium">{{ tournament.category }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Prize:</span>
                <span class="font-medium">{{ tournament.prize }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Participants:</span>
                <span class="font-medium">{{ tournament.participants }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Duration:</span>
                <span class="font-medium">{{ tournament.startDate }} - {{ tournament.endDate }}</span>
              </div>
            </div>
            <div class="flex justify-end">
              <button class="btn btn-primary">Join Tournament</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .badge {
      @apply px-2 py-1 rounded-full text-sm font-medium;
    }
    .badge.upcoming {
      @apply bg-blue-100 text-blue-800;
    }
    .badge.active {
      @apply bg-green-100 text-green-800;
    }
    .badge.completed {
      @apply bg-gray-100 text-gray-800;
    }
  `]
})
export class TournamentsComponent {
    tournaments: Tournament[] = [
        {
            id: '1',
            title: 'AI Ethics Championship',
            description: 'Compete in challenging scenarios focused on AI ethics and responsible AI development.',
            startDate: '2024-04-01',
            endDate: '2024-04-15',
            participants: 128,
            status: 'upcoming',
            prize: '$5,000',
            category: 'Ethics'
        },
        {
            id: '2',
            title: 'Machine Learning Masters',
            description: 'Showcase your ML expertise in this competitive tournament.',
            startDate: '2024-03-15',
            endDate: '2024-03-30',
            participants: 256,
            status: 'active',
            prize: '$10,000',
            category: 'Machine Learning'
        },
        {
            id: '3',
            title: 'AI Safety Challenge',
            description: 'Test your knowledge of AI safety principles and best practices.',
            startDate: '2024-02-01',
            endDate: '2024-02-15',
            participants: 64,
            status: 'completed',
            prize: '$3,000',
            category: 'Safety'
        }
    ];

    getStatusClass(status: string): string {
        switch (status) {
            case 'upcoming':
                return 'badge upcoming';
            case 'active':
                return 'badge active';
            case 'completed':
                return 'badge completed';
            default:
                return 'badge';
        }
    }
}
