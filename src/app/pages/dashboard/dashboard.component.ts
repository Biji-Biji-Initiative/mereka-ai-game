import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/game.service';

interface SkillLevel {
  name: string;
  level: number;
  progress: number;
}

interface Challenge {
  title: string;
  score: number;
  focusArea: string;
  date: Date;
}

interface Badge {
  name: string;
  description: string;
  date: Date;
}

interface DashboardData {
  level: number;
  overallProgress: number;
  challengesCompleted: number;
  totalBadges: number;
  streakDays: number;
  skillLevels: SkillLevel[];
  recentChallenges: Challenge[];
  badges: Badge[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData = {
    level: 1,
    overallProgress: 0,
    challengesCompleted: 0,
    totalBadges: 0,
    streakDays: 0,
    skillLevels: [],
    recentChallenges: [],
    badges: []
  };

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      const data = await this.gameService.getDashboardData();

      // Transform the data
      this.dashboardData = {
        ...data,
        skillLevels: this.transformSkillLevels(data.skillLevels),
        recentChallenges: data.recentChallenges.map(challenge => ({
          ...challenge,
          date: new Date(challenge.date)
        })),
        badges: data.badges.map(badge => ({
          ...badge,
          date: new Date(badge.date)
        }))
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Handle error appropriately
    }
  }

  private transformSkillLevels(skillLevels: Record<string, number>): SkillLevel[] {
    return Object.entries(skillLevels).map(([name, level]) => ({
      name: this.formatSkillName(name),
      level,
      progress: this.calculateSkillProgress(level)
    }));
  }

  private formatSkillName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private calculateSkillProgress(level: number): number {
    // Assuming each level requires 100 points and max level is 10
    return (level / 10) * 100;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}
