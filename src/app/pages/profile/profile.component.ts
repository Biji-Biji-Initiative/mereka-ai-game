import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ProfileStats {
    totalChallenges: number;
    completedChallenges: number;
    winRate: number;
    averageScore: number;
    rank: string;
    experience: number;
    level: number;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    date: string;
    icon: string;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Profile Header -->
      <div class="flex items-center gap-6 mb-8">
        <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
          <span class="text-3xl">👤</span>
        </div>
        <div>
          <h1 class="text-3xl font-bold">John Doe</h1>
          <p class="text-gray-600">AI Ethics Expert</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="badge badge-primary">Level {{ profileStats.level }}</span>
            <span class="text-gray-500">{{ profileStats.experience }} XP</span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <h3 class="text-lg font-semibold mb-2">Challenges</h3>
            <p class="text-3xl font-bold">{{ profileStats.completedChallenges }}/{{ profileStats.totalChallenges }}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h3 class="text-lg font-semibold mb-2">Win Rate</h3>
            <p class="text-3xl font-bold">{{ profileStats.winRate }}%</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h3 class="text-lg font-semibold mb-2">Average Score</h3>
            <p class="text-3xl font-bold">{{ profileStats.averageScore }}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h3 class="text-lg font-semibold mb-2">Rank</h3>
            <p class="text-3xl font-bold">{{ profileStats.rank }}</p>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <h2 class="text-2xl font-bold mb-6">Achievements</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let achievement of achievements" class="card">
          <div class="card-body">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span class="text-2xl">{{ achievement.icon }}</span>
              </div>
              <div>
                <h3 class="font-semibold">{{ achievement.title }}</h3>
                <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ achievement.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
    profileStats: ProfileStats = {
        totalChallenges: 50,
        completedChallenges: 35,
        winRate: 75,
        averageScore: 85,
        rank: 'Master',
        experience: 2500,
        level: 5
    };

    achievements: Achievement[] = [
        {
            id: '1',
            title: 'Ethics Expert',
            description: 'Completed 10 ethics challenges with perfect scores',
            date: '2024-03-15',
            icon: '🏆'
        },
        {
            id: '2',
            title: 'Quick Thinker',
            description: 'Solved a challenge in under 5 minutes',
            date: '2024-03-10',
            icon: '⚡'
        },
        {
            id: '3',
            title: 'Tournament Champion',
            description: 'Won first place in the AI Ethics Championship',
            date: '2024-02-28',
            icon: '🎯'
        }
    ];
}
