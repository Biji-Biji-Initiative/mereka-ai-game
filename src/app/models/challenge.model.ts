export interface RoundChallenge {
    id: string;
    title: string;
    description: string;
    aiResponse?: string;
    steps: string[];
}

export interface RoundData {
    roundNumber: number;
    question: string;
    answer: string;
    aiResponse?: string;
    evaluation?: any;
}

export interface ChallengeResponse {
    challengeId: string;
    response: string;
    aiResponse: string;
    evaluation: {
        metrics: {
            creativity: number;
            practicality: number;
            depth: number;
            humanEdge: number;
            overall: number;
        };
        feedback: string[];
        strengths: string[];
        improvements: string[];
        comparison: {
            userScore: number;
            rivalScore: number;
            advantage: 'user' | 'rival' | 'tie';
            advantageReason: string;
        };
        badges: string[];
    };
    question: string;
}
