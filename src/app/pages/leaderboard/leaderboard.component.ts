import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaderboardService, LeaderboardEntry } from '../../services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <div class="flex space-x-4">
          <select [(ngModel)]="selectedTimeFrame" (change)="loadLeaderboard()" class="border rounded-md px-3 py-2">
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="day">Today</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="text-gray-600">Loading leaderboard data...</div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div class="text-red-600">Failed to load leaderboard data. Please try again later.</div>
      </div>

      <!-- Leaderboard Table -->
      <div *ngIf="!loading && !error" class="bg-white rounded-lg shadow overflow-hidden">
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
                Focus Area
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
                <div class="text-sm text-gray-900">{{ entry.score }}%</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ entry.challenges }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ entry.focusArea }}</div>
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
  leaderboardData: LeaderboardEntry[] = [];
  loading = true;
  error = false;
  selectedTimeFrame: 'all' | 'month' | 'week' | 'day' = 'all';

  constructor(private leaderboardService: LeaderboardService) { }

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  async loadLeaderboard(): Promise<void> {
    this.loading = true;
    this.error = false;

    try {
      this.leaderboardData = await this.leaderboardService.getLeaderboard(this.selectedTimeFrame);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }
}
