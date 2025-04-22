// Cloud Function Payload Model

// User Profile Interface
export interface UserProfilePayload {
    name: string;
    email: string;
    professionalTitle: string;
    location: string;
    currentRoute: string;
    isAnonymous: boolean;
}

// Trait Answer Interface
export interface TraitAnswerPayload {
    questionId: number;
    answer: number;
}

// Trait Question Interface
export interface TraitQuestionPayload {
    id: number;
    text: string;
    options: string[];
}

// Traits Data Interface
export interface TraitsDataPayload {
    answers: TraitAnswerPayload[];
    questions: TraitQuestionPayload[];
}

// Attitude Answer Interface
export interface AttitudeAnswerPayload {
    questionId: number;
    answer: number;
}

// Attitude Question Interface
export interface AttitudeQuestionPayload {
    id: number;
    text: string;
    options: string[];
}

// Attitudes Data Interface
export interface AttitudesDataPayload {
    answers: AttitudeAnswerPayload[];
    questions: AttitudeQuestionPayload[];
}

// Round Generation Options Interface
export interface RoundGenerationOptionsPayload {
    roundTypes: string[];
    difficultyLevels: string[];
    contextCategories: string[];
    focusAreas: string[];
    challengeFormats: string[];
    answerTypes: string[];
}

// Main Cloud Function Payload Interface
export interface CloudFunctionPayload {
    userId: string;
    focusType: string;
    context: string;
    traits: TraitsDataPayload;
    attitudes: AttitudesDataPayload;
    userProfile: UserProfilePayload;
    options: RoundGenerationOptionsPayload;
}

// Example payload for testing
export const exampleCloudFunctionPayload: CloudFunctionPayload = {
    userId: "user123",
    focusType: "leadership",
    context: "Generate a challenge focused on leadership in a professional setting",
    traits: {
        answers: [
            {
                questionId: 1,
                answer: 4
            },
            {
                questionId: 2,
                answer: 3
            },
            {
                questionId: 3,
                answer: 5
            },
            {
                questionId: 4,
                answer: 2
            },
            {
                questionId: 5,
                answer: 4
            }
        ],
        questions: [
            {
                id: 1,
                text: "How do you handle stress?",
                options: ["Very poorly", "Poorly", "Neutral", "Well", "Very well"]
            },
            {
                id: 2,
                text: "How creative do you consider yourself?",
                options: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"]
            },
            {
                id: 3,
                text: "How do you approach problem-solving?",
                options: ["Avoid it", "With difficulty", "Neutral", "With confidence", "With enthusiasm"]
            },
            {
                id: 4,
                text: "How do you work in teams?",
                options: ["Prefer to work alone", "With difficulty", "Neutral", "Well", "Very well"]
            },
            {
                id: 5,
                text: "How do you handle change?",
                options: ["Very poorly", "Poorly", "Neutral", "Well", "Very well"]
            }
        ]
    },
    attitudes: {
        answers: [
            {
                questionId: 1,
                answer: 5
            },
            {
                questionId: 2,
                answer: 4
            },
            {
                questionId: 3,
                answer: 3
            },
            {
                questionId: 4,
                answer: 5
            },
            {
                questionId: 5,
                answer: 4
            }
        ],
        questions: [
            {
                id: 1,
                text: "How important is leadership to you?",
                options: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"]
            },
            {
                id: 2,
                text: "How do you feel about taking initiative?",
                options: ["Avoid it", "Reluctant", "Neutral", "Comfortable", "Enthusiastic"]
            },
            {
                id: 3,
                text: "How do you view authority?",
                options: ["Distrust", "Skeptical", "Neutral", "Respect", "Embrace"]
            },
            {
                id: 4,
                text: "How do you feel about responsibility?",
                options: ["Avoid it", "Reluctant", "Neutral", "Accept it", "Seek it"]
            },
            {
                id: 5,
                text: "How do you view teamwork?",
                options: ["Prefer to work alone", "Reluctant", "Neutral", "Enjoy it", "Essential"]
            }
        ]
    },
    userProfile: {
        name: "John Doe",
        email: "john.doe@example.com",
        professionalTitle: "Project Manager",
        location: "New York, USA",
        currentRoute: "/focus",
        isAnonymous: false
    },
    options: {
        roundTypes: [
            "scenario", "reflection", "problem-solving", "decision-making",
            "self-assessment", "hypothetical", "analytical", "creative"
        ],
        difficultyLevels: ["beginner", "intermediate", "advanced", "expert"],
        contextCategories: [
            "personal", "professional", "educational", "social",
            "emotional", "ethical", "cultural", "environmental"
        ],
        focusAreas: [
            "leadership", "communication", "teamwork", "problem-solving",
            "adaptability", "creativity", "emotional intelligence", "critical thinking"
        ],
        challengeFormats: [
            "multiple-choice", "open-ended", "scenario-based", "reflection",
            "self-assessment", "hypothetical", "analytical", "creative"
        ],
        answerTypes: [
            "single-select", "multi-select", "text", "rating", "ranking"
        ]
    }
};
