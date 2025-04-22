// Cloud Function Response Model

// Challenge Interface
export interface ChallengeResponse {
    id: string;
    question: string;
    type: string;
    options?: string[];
    correctAnswer?: string;
    points: number;
}

// Round Response Interface
export interface RoundResponse {
    id: string;
    title: string;
    description: string;
    type: string;
    context: string;
    difficulty: number;
    challenges: ChallengeResponse[];
    estimatedTime: number; // in minutes
}

// Example response for testing
export const exampleCloudFunctionResponse: RoundResponse = {
    id: "round123",
    title: "Leadership Challenge",
    description: "A series of challenges to test and improve your leadership skills",
    type: "scenario",
    context: "professional",
    difficulty: 3,
    challenges: [
        {
            id: "challenge1",
            question: "You're leading a team project that's falling behind schedule. How would you address this situation?",
            type: "open-ended",
            points: 10
        },
        {
            id: "challenge2",
            question: "A team member consistently disagrees with your approach. How do you handle this conflict?",
            type: "scenario-based",
            points: 15
        },
        {
            id: "challenge3",
            question: "Your team needs to make a critical decision with limited information. What process would you follow?",
            type: "decision-making",
            points: 20
        },
        {
            id: "challenge4",
            question: "How would you motivate a team that's lost enthusiasm for a project?",
            type: "reflection",
            points: 15
        }
    ],
    estimatedTime: 20
};
