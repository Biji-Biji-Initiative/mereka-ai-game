/**
 * Types for the Achievement Badge System
 */

// Define progress as an object to match API service definition
export interface BadgeProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
  unlockedAt?: string;
  progress?: BadgeProgress; // Use the object type
  requirement: string;
  secret?: boolean; // If true, details are hidden until unlocked
}

export type BadgeCategory = 
  | 'cognitive' 
  | 'creative' 
  | 'analytical' 
  | 'social' 
  | 'achievement' 
  | 'mastery';

export type BadgeTier = 
  | 'bronze' 
  | 'silver' 
  | 'gold' 
  | 'platinum';

export interface BadgeUnlockEvent {
  badgeId: string;
  timestamp: string;
  context?: Record<string, any>;
}

// Badge collection for a user
export interface BadgeCollection {
  userId: string;
  unlockedBadges: Badge[];
  inProgressBadges: Badge[];
  totalBadges: number;
  totalUnlocked: number;
}

// Badge unlock conditions
export interface BadgeUnlockCondition {
  type: BadgeUnlockConditionType;
  threshold: number;
  metric: string;
  comparison: 'greater' | 'equal' | 'less';
  context?: Record<string, any>;
}

export type BadgeUnlockConditionType = 
  | 'score_threshold' 
  | 'completion_count' 
  | 'streak_days' 
  | 'trait_value' 
  | 'rival_victories' 
  | 'perfect_round';
