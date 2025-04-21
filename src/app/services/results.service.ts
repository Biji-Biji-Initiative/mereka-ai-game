import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface RoundResult {
    score: number;
    strengths: string[];
    areas: string[];
    comparison: {
        humanScore: number;
        aiScore: number;
        difference: number;
    };
}

export interface ResultsData {
    overallScore: number;
    focusArea: {
        name: string;
        description: string;
    };
    rounds: {
        round1: RoundResult;
        round2: RoundResult;
        round3: RoundResult;
    };
    badges: {
        id: string;
        name: string;
        description: string;
        icon: string;
    }[];
    insights: string[];
    recommendations: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ResultsService {
    private dummyResults: ResultsData = {
        overallScore: 85,
        focusArea: {
            name: "Creative Problem Solving",
            description: "Your ability to approach problems with innovative and unique solutions"
        },
        rounds: {
            round1: {
                score: 82,
                strengths: [
                    "Strong analytical thinking",
                    "Clear communication",
                    "Innovative approach"
                ],
                areas: [
                    "Consider more edge cases",
                    "Provide more detailed explanations"
                ],
                comparison: {
                    humanScore: 82,
                    aiScore: 75,
                    difference: 7
                }
            },
            round2: {
                score: 88,
                strengths: [
                    "Excellent pattern recognition",
                    "Creative solutions",
                    "Thorough analysis"
                ],
                areas: [
                    "Consider alternative perspectives",
                    "More quantitative analysis"
                ],
                comparison: {
                    humanScore: 88,
                    aiScore: 80,
                    difference: 8
                }
            },
            round3: {
                score: 85,
                strengths: [
                    "Strong self-reflection",
                    "Clear articulation",
                    "Balanced perspective"
                ],
                areas: [
                    "More specific examples",
                    "Deeper technical analysis"
                ],
                comparison: {
                    humanScore: 85,
                    aiScore: 78,
                    difference: 7
                }
            }
        },
        badges: [
            {
                id: "creative-master",
                name: "Creative Master",
                description: "Demonstrated exceptional creative problem-solving abilities",
                icon: "🎨"
            },
            {
                id: "analytical-genius",
                name: "Analytical Genius",
                description: "Showed outstanding analytical and logical thinking",
                icon: "🧠"
            },
            {
                id: "communication-pro",
                name: "Communication Pro",
                description: "Excellent communication and articulation skills",
                icon: "💬"
            }
        ],
        insights: [
            "Your creative approach consistently outperformed AI solutions",
            "You showed strong adaptability across different challenge types",
            "Your communication skills helped convey complex ideas effectively"
        ],
        recommendations: [
            "Consider exploring more technical aspects in your solutions",
            "Try incorporating more quantitative analysis in your approach",
            "Continue developing your pattern recognition skills"
        ]
    };

    getResults(): Observable<ResultsData> {
        return of(this.dummyResults);
    }
}
