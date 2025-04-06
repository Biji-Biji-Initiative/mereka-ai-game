/**
 * Types for the AI Rival System
 */

import { Trait, AiAttitude } from '@/store/useGameStore';

export interface RivalTrait extends Trait {
  // How this trait compares to the user's trait (higher means rival is stronger in this trait)
  comparison: 'stronger' | 'weaker' | 'equal';
  // Explanation of how this trait manifests in the rival
  manifestation: string;
}

export interface Rival {
  id: string;
  name: string;
  avatarUrl: string;
  personalityType: string;
  description: string;
  traits: RivalTrait[];
  attitudes?: AiAttitude[];
  strengths: string[];
  weaknesses: string[];
  
  // Performance predictions for each round
  predictions: {
    round1?: number;
    round2?: number;
    round3?: number;
  };
  
  // Actual performance in each round (filled as rounds are completed)
  performance: {
    round1?: number;
    round2?: number;
    round3?: number;
  };
  
  // Overall comparison to user
  overallComparison?: {
    userScore: number;
    rivalScore: number;
    difference: number;
    userAdvantageAreas: string[];
    rivalAdvantageAreas: string[];
  };
  
  // Rivalry intensity (affects UI and messaging)
  rivalryIntensity: 'friendly' | 'competitive' | 'intense';
  
  // Taunt messages that appear during challenges
  tauntMessages: string[];
  
  // Encouragement messages that appear during challenges
  encouragementMessages: string[];
}

// Rival generation parameters
export interface RivalGenerationParams {
  userTraits: Trait[];
  userAttitudes?: AiAttitude[];
  focusArea?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  rivalryStyle?: 'friendly' | 'competitive' | 'intense';
}

// Rival avatar options
export const RIVAL_AVATARS = [
  '/assets/rivals/rival-1.png',
  '/assets/rivals/rival-2.png',
  '/assets/rivals/rival-3.png',
  '/assets/rivals/rival-4.png',
  '/assets/rivals/rival-5.png',
];

// Rival personality types
export const RIVAL_PERSONALITY_TYPES = [
  'Analytical Processor',
  'Creative Synthesizer',
  'Logical Optimizer',
  'Intuitive Predictor',
  'Systematic Evaluator',
  'Adaptive Learner',
  'Strategic Planner',
];
