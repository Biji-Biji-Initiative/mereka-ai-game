import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    challenges: number;
    badges: string[];
}

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <div class="flex space-x-4">
          <select class="border rounded-md px-3 py-2">
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="day">Today</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Challenges
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Badges
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let entry of leaderboardData" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ entry.rank }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {{ entry.name.charAt(0) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ entry.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ entry.score }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ entry.challenges }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-1">
                  <span *ngFor="let badge of entry.badges"
                        class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                    {{ badge }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
    leaderboardData: LeaderboardEntry[] = [
        { rank: 1, name: 'John Doe', score: 9850, challenges: 42, badges: ['Speed Demon', 'Perfect Score'] },
        { rank: 2, name: 'Jane Smith', score: 9720, challenges: 38, badges: ['Innovator', 'Quick Thinker'] },
        { rank: 3, name: 'Mike Johnson', score: 9650, challenges: 40, badges: ['Precision', 'Problem Solver'] },
        { rank: 4, name: 'Sarah Wilson', score: 9580, challenges: 35, badges: ['Ethics Master', 'Team Player'] },
        { rank: 5, name: 'Alex Brown', score: 9450, challenges: 36, badges: ['Empathy', 'Communication'] },
        { rank: 6, name: 'Emily Davis', score: 9320, challenges: 33, badges: ['Strategy', 'Adaptability'] },
        { rank: 7, name: 'David Lee', score: 9250, challenges: 31, badges: ['Innovation', 'Creativity'] },
        { rank: 8, name: 'Lisa Chen', score: 9180, challenges: 30, badges: ['Logic', 'Analysis'] },
        { rank: 9, name: 'Tom Wilson', score: 9050, challenges: 28, badges: ['Ethics', 'Judgment'] },
        { rank: 10, name: 'Amy Taylor', score: 8920, challenges: 27, badges: ['Empathy', 'Understanding'] }
    ];

    constructor() { }

    ngOnInit(): void {
        // In a real app, this would fetch data from a service
    }
}
