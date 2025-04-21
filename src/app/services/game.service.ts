import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResultsData } from './results.service';

interface RoundData {
  response?: string;
  evaluation?: RoundEvaluation;
}

interface Challenge {
  id: string;
  description: string;
}

interface RoundEvaluation {
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
}

interface Profile {
  id: string;
  badges: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ChallengeResponses {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private roundData: Map<number, RoundData> = new Map();
  private profileId: string | null = null;

  private readonly challenges: { [key: number]: Challenge; } = {
    1: {
      id: 'challenge-1',
      description: 'Analyze the given scenario and identify potential patterns or trends that could impact decision-making.'
    },
    2: {
      id: 'challenge-2',
      description: 'Based on the patterns identified in Round 1, propose innovative solutions that leverage both human insight and AI capabilities.'
    },
    3: {
      id: 'challenge-3',
      description: 'Consider the ethical implications of your proposed solutions and how they balance efficiency with human values.'
    }
  };

  private readonly responses: ChallengeResponses = {
    'challenge-1': 'The AI analyzes the data and identifies several key patterns: increasing complexity in decision-making processes, growing importance of human intuition in uncertain scenarios, and the need for balanced human-AI collaboration.',
    'challenge-2': 'Based on the patterns, I recommend implementing a hybrid decision-making system that combines AI data analysis with human expertise. This approach ensures both efficiency and adaptability.',
    'challenge-3': 'While AI can process vast amounts of data quickly, human oversight remains crucial for ethical considerations and ensuring decisions align with societal values and cultural norms.'
  };

  constructor() { }

  async generateChallenge(round: number): Promise<Challenge> {
    return this.challenges[round] || {
      id: `challenge-${round}`,
      description: 'Default challenge description'
    };
  }

  async generateAIResponse(challengeId: string): Promise<string> {
    return this.responses[challengeId] || 'AI response not available.';
  }

  getRoundData(round: number): RoundData {
    return this.roundData.get(round) || {};
  }

  async submitResponse(data: { challengeId: string; response: string; round: number; aiResponse?: string; }): Promise<RoundEvaluation> {
    // Store the response
    this.roundData.set(data.round, { response: data.response });

    // Generate mock evaluation
    const evaluation = await this.evaluateResponse(data.round, data.response, data.challengeId, data.aiResponse);

    // Store the evaluation
    this.roundData.set(data.round, {
      ...this.roundData.get(data.round),
      evaluation
    });

    return evaluation;
  }

  async evaluateResponse(round: number, userResponse: string, challengeId: string, aiResponse?: string): Promise<RoundEvaluation> {
    const userScore = Math.floor(Math.random() * 30) + 70;
    const rivalScore = Math.floor(Math.random() * 30) + 70;
    const advantage = userScore > rivalScore ? 'user' : userScore < rivalScore ? 'rival' : 'tie';

    return {
      metrics: {
        creativity: Math.floor(Math.random() * 30) + 70, // 70-100
        practicality: Math.floor(Math.random() * 30) + 70,
        depth: Math.floor(Math.random() * 30) + 70,
        humanEdge: Math.floor(Math.random() * 30) + 70,
        overall: Math.floor(Math.random() * 30) + 70
      },
      feedback: [
        'Excellent use of critical thinking',
        'Strong consideration of multiple perspectives',
        'Clear articulation of ideas'
      ],
      strengths: [
        'Creative problem-solving approach',
        'Strong analytical skills',
        'Clear communication'
      ],
      improvements: [
        'Consider more diverse scenarios',
        'Expand on practical implementation details',
        'Deepen analysis of long-term impacts'
      ],
      comparison: {
        userScore,
        rivalScore,
        advantage,
        advantageReason: 'Your response showed exceptional creativity and human insight.'
      },
      badges: ['Creative Thinker', 'Problem Solver', 'Strategic Mind']
    };
  }

  async generateProfile(data: {
    round1Response: string;
    round2Response: string;
    round3Response: string;
    finalEvaluation: RoundEvaluation;
  }): Promise<Profile> {
    const profile: Profile = {
      id: 'profile-' + Math.random().toString(36).substr(2, 9),
      badges: [
        'Strategic Thinker',
        'Innovation Champion',
        'Ethical Leader'
      ],
      strengths: [
        'Strong analytical capabilities',
        'Creative problem-solving',
        'Balanced decision-making'
      ],
      weaknesses: [
        'Could expand on implementation details',
        'May need more diverse perspectives',
        'Consider broader implications'
      ],
      recommendations: [
        'Focus on practical applications',
        'Develop more comprehensive solutions',
        'Strengthen ethical considerations'
      ]
    };

    return profile;
  }

  async saveProfileId(profileId: string): Promise<void> {
    this.profileId = profileId;
  }

  getResults(): Observable<ResultsData> {
    // Get data from all rounds
    const round1Data = this.getRoundData(1);
    const round2Data = this.getRoundData(2);
    const round3Data = this.getRoundData(3);

    // Create results data based on the rounds
    const results: ResultsData = {
      overallScore: Math.floor((
        (round1Data.evaluation?.metrics?.overall ?? 0) +
        (round2Data.evaluation?.metrics?.overall ?? 0) +
        (round3Data.evaluation?.metrics?.overall ?? 0)
      ) / 3),
      focusArea: {
        name: "Creative Problem Solving",
        description: "Your ability to approach problems with innovative and unique solutions"
      },
      rounds: {
        round1: {
          score: round1Data.evaluation?.metrics.overall || 0,
          strengths: round1Data.evaluation?.strengths || [],
          areas: round1Data.evaluation?.improvements || [],
          comparison: {
            humanScore: round1Data.evaluation?.comparison.userScore || 0,
            aiScore: round1Data.evaluation?.comparison.rivalScore || 0,
            difference: (round1Data.evaluation?.comparison.userScore || 0) - (round1Data.evaluation?.comparison.rivalScore || 0)
          }
        },
        round2: {
          score: round2Data.evaluation?.metrics.overall || 0,
          strengths: round2Data.evaluation?.strengths || [],
          areas: round2Data.evaluation?.improvements || [],
          comparison: {
            humanScore: round2Data.evaluation?.comparison.userScore || 0,
            aiScore: round2Data.evaluation?.comparison.rivalScore || 0,
            difference: (round2Data.evaluation?.comparison.userScore || 0) - (round2Data.evaluation?.comparison.rivalScore || 0)
          }
        },
        round3: {
          score: round3Data.evaluation?.metrics.overall || 0,
          strengths: round3Data.evaluation?.strengths || [],
          areas: round3Data.evaluation?.improvements || [],
          comparison: {
            humanScore: round3Data.evaluation?.comparison.userScore || 0,
            aiScore: round3Data.evaluation?.comparison.rivalScore || 0,
            difference: (round3Data.evaluation?.comparison.userScore || 0) - (round3Data.evaluation?.comparison.rivalScore || 0)
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

    return of(results);
  }
}
