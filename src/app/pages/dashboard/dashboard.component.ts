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
            // Use dummy data for now
            this.dashboardData = {
                level: 3,
                overallProgress: 75,
                challengesCompleted: 12,
                totalBadges: 5,
                streakDays: 7,
                skillLevels: [
                    { name: 'Critical Thinking', level: 4, progress: 80 },
                    { name: 'Problem Solving', level: 3, progress: 60 },
                    { name: 'Communication', level: 5, progress: 100 },
                    { name: 'Creativity', level: 4, progress: 80 },
                    { name: 'Analytical', level: 3, progress: 60 },
                    { name: 'Strategic', level: 4, progress: 80 }
                ],
                recentChallenges: [
                    {
                        title: 'AI vs Human Decision Making',
                        score: 85,
                        focusArea: 'Critical Thinking',
                        date: new Date('2023-05-15')
                    },
                    {
                        title: 'Ethical AI Implementation',
                        score: 92,
                        focusArea: 'Problem Solving',
                        date: new Date('2023-05-10')
                    },
                    {
                        title: 'Future of Work',
                        score: 78,
                        focusArea: 'Strategic',
                        date: new Date('2023-05-05')
                    }
                ],
                badges: [
                    {
                        name: 'Critical Thinker',
                        description: 'Achieved high scores in critical thinking challenges',
                        date: new Date('2023-05-01')
                    },
                    {
                        name: 'Problem Solver',
                        description: 'Successfully completed 10 challenges',
                        date: new Date('2023-04-28')
                    },
                    {
                        name: 'Communication Pro',
                        description: 'Demonstrated excellent communication skills',
                        date: new Date('2023-04-25')
                    },
                    {
                        name: 'Creative Mind',
                        description: 'Showed exceptional creativity in solutions',
                        date: new Date('2023-04-20')
                    },
                    {
                        name: 'Strategic Planner',
                        description: 'Achieved high scores in strategic challenges',
                        date: new Date('2023-04-15')
                    }
                ]
            };
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Handle error appropriately
        }
    }

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }
}
