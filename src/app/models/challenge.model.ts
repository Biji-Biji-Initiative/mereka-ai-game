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
    evaluation: any;
    question: string;
}
