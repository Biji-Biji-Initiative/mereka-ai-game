'use client';

/**
 * Evaluation Service
 * 
 * This service handles the evaluation of user responses in each round
 * and provides feedback, metrics, and comparisons with the AI rival.
 */

import { RoundResponse } from '@/store/useGameStore';
import { useRivalStore } from '@/store/useRivalStore';

// Define evaluation metrics
export interface EvaluationMetrics {
  creativity: number;
  practicality: number;
  depth: number;
  humanEdge: number;
  overall: number;
}

// Define evaluation result
export interface EvaluationResult {
  metrics: EvaluationMetrics;
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

// Default evaluation metrics
const DEFAULT_METRICS: EvaluationMetrics = {
  creativity: 0,
  practicality: 0,
  depth: 0,
  humanEdge: 0,
  overall: 0
};

/**
 * Evaluates a user response for a specific round
 * @param round The round number (1, 2, or 3)
 * @param userResponse The user's response text
 * @param challenge The challenge text
 * @param aiResponse The AI's response (if available)
 * @param focusArea The user's selected focus area
 * @returns An evaluation result with metrics, feedback, and comparison
 */
export const evaluateResponse = async (
  round: number,
  userResponse: string,
  challenge: string,
  aiResponse?: string,
  focusArea?: string
): Promise<EvaluationResult> => {
  // In a real implementation, this would call an API endpoint
  // For now, we'll simulate the evaluation with some logic

  // Calculate metrics based on response length and complexity
  const wordCount = userResponse.split(/\s+/).length;
  const sentenceCount = userResponse.split(/[.!?]+/).length;
  const avgWordLength = userResponse.length / wordCount;
  
  // Simple metrics calculation (would be more sophisticated in production)
  const creativity = Math.min(100, Math.max(0, wordCount / 5 + Math.random() * 20));
  const practicality = Math.min(100, Math.max(0, sentenceCount * 5 + Math.random() * 20));
  const depth = Math.min(100, Math.max(0, avgWordLength * 10 + Math.random() * 20));
  const humanEdge = Math.min(100, Math.max(0, (creativity + depth) / 2 + Math.random() * 10));
  
  // Overall score is weighted average
  const overall = Math.min(100, Math.max(0, 
    (creativity * 0.25 + practicality * 0.25 + depth * 0.25 + humanEdge * 0.25)
  ));
  
  // Generate rival score (slightly lower than user to encourage engagement)
  const rivalScore = Math.max(0, overall - 5 - Math.random() * 10);
  
  // Determine advantage
  let advantage: 'user' | 'rival' | 'tie' = 'tie';
  let advantageReason = '';
  
  if (overall > rivalScore + 5) {
    advantage = 'user';
    advantageReason = 'Your response showed greater creativity and human perspective.';
  } else if (rivalScore > overall + 5) {
    advantage = 'rival';
    advantageReason = 'The AI demonstrated stronger analytical capabilities in this round.';
  } else {
    advantage = 'tie';
    advantageReason = 'Both approaches had unique strengths and complemented each other well.';
  }
  
  // Generate feedback based on metrics
  const feedback = generateFeedback(round, {
    creativity,
    practicality,
    depth,
    humanEdge,
    overall
  });
  
  // Generate strengths and improvements
  const strengths = generateStrengths(round, {
    creativity,
    practicality,
    depth,
    humanEdge,
    overall
  });
  
  const improvements = generateImprovements(round, {
    creativity,
    practicality,
    depth,
    humanEdge,
    overall
  });
  
  // Check for any badges earned
  const badges = checkForBadges(round, {
    creativity,
    practicality,
    depth,
    humanEdge,
    overall
  });
  
  return {
    metrics: {
      creativity,
      practicality,
      depth,
      humanEdge,
      overall
    },
    feedback,
    strengths,
    improvements,
    comparison: {
      userScore: overall,
      rivalScore,
      advantage,
      advantageReason
    },
    badges
  };
};

/**
 * Generate feedback based on evaluation metrics
 */
const generateFeedback = (round: number, metrics: EvaluationMetrics): string[] => {
  const feedback: string[] = [];
  
  // General feedback based on overall score
  if (metrics.overall >= 80) {
    feedback.push('Excellent work! Your response demonstrates exceptional human insight.');
  } else if (metrics.overall >= 60) {
    feedback.push('Good job! Your response shows solid understanding and human perspective.');
  } else if (metrics.overall >= 40) {
    feedback.push('Decent effort. Your response has some good elements but could be developed further.');
  } else {
    feedback.push('Your response needs more development to fully demonstrate your human edge.');
  }
  
  // Round-specific feedback
  if (round === 1) {
    feedback.push('Your initial approach to the challenge shows your unique human perspective.');
  } else if (round === 2) {
    feedback.push('Your analysis of the AI\'s approach highlights interesting comparisons between human and AI thinking.');
  } else if (round === 3) {
    feedback.push('Your final response demonstrates how you\'ve integrated insights from previous rounds.');
  }
  
  // Metric-specific feedback
  if (metrics.creativity >= 70) {
    feedback.push('Your creative thinking stands out as a key human strength.');
  }
  
  if (metrics.depth >= 70) {
    feedback.push('The depth of your analysis demonstrates sophisticated human reasoning.');
  }
  
  if (metrics.humanEdge >= 70) {
    feedback.push('You\'ve effectively leveraged your human edge in this response.');
  }
  
  return feedback;
};

/**
 * Generate strengths based on evaluation metrics
 */
const generateStrengths = (round: number, metrics: EvaluationMetrics): string[] => {
  const strengths: string[] = [];
  
  if (metrics.creativity >= 60) {
    strengths.push('Creative approach to problem-solving');
  }
  
  if (metrics.practicality >= 60) {
    strengths.push('Practical implementation considerations');
  }
  
  if (metrics.depth >= 60) {
    strengths.push('Deep analytical thinking');
  }
  
  if (metrics.humanEdge >= 60) {
    strengths.push('Strong human perspective');
  }
  
  // Add round-specific strengths
  if (round === 1 && metrics.overall >= 50) {
    strengths.push('Effective initial problem framing');
  }
  
  if (round === 2 && metrics.overall >= 50) {
    strengths.push('Insightful comparison with AI approach');
  }
  
  if (round === 3 && metrics.overall >= 50) {
    strengths.push('Strong integration of previous insights');
  }
  
  return strengths;
};

/**
 * Generate improvement suggestions based on evaluation metrics
 */
const generateImprovements = (round: number, metrics: EvaluationMetrics): string[] => {
  const improvements: string[] = [];
  
  if (metrics.creativity < 60) {
    improvements.push('Consider more innovative or unconventional approaches');
  }
  
  if (metrics.practicality < 60) {
    improvements.push('Focus more on practical implementation details');
  }
  
  if (metrics.depth < 60) {
    improvements.push('Develop your analysis with more depth and nuance');
  }
  
  if (metrics.humanEdge < 60) {
    improvements.push('Emphasize uniquely human perspectives more clearly');
  }
  
  // Add round-specific improvements
  if (round === 1 && metrics.overall < 70) {
    improvements.push('Frame the problem more comprehensively in your initial approach');
  }
  
  if (round === 2 && metrics.overall < 70) {
    improvements.push('Provide more detailed comparison with the AI\'s approach');
  }
  
  if (round === 3 && metrics.overall < 70) {
    improvements.push('Better integrate insights from previous rounds into your final response');
  }
  
  return improvements;
};

/**
 * Check for badges earned based on evaluation metrics
 */
const checkForBadges = (round: number, metrics: EvaluationMetrics): string[] => {
  const badges: string[] = [];
  
  // Performance badges
  if (metrics.overall >= 90) {
    badges.push('excellence');
  } else if (metrics.overall >= 80) {
    badges.push('mastery');
  } else if (metrics.overall >= 70) {
    badges.push('proficiency');
  }
  
  // Specialty badges
  if (metrics.creativity >= 85) {
    badges.push('creative-genius');
  }
  
  if (metrics.practicality >= 85) {
    badges.push('practical-wizard');
  }
  
  if (metrics.depth >= 85) {
    badges.push('deep-thinker');
  }
  
  if (metrics.humanEdge >= 85) {
    badges.push('human-edge-champion');
  }
  
  // Round-specific badges
  if (round === 3 && metrics.overall >= 75) {
    badges.push('challenge-master');
  }
  
  return badges;
};

/**
 * Hook to evaluate a round response
 */
export const useEvaluateRound = () => {
  const rivalState = useRivalStore.getState();
  
  return async (
    round: number,
    userResponse: RoundResponse,
    challenge: string,
    focusArea?: string
  ): Promise<EvaluationResult> => {
    return evaluateResponse(
      round,
      userResponse.userResponse,
      challenge,
      userResponse.aiResponse,
      focusArea
    );
  };
};
