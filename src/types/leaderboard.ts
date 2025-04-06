/**
 * Types for the Challenge Leaderboard System
 */

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  completedAt: string;
  focusArea?: string;
  rank?: number;
  isCurrentUser?: boolean;
}

export interface Leaderboard {
  id: string;
  title: string;
  description: string;
  entries: LeaderboardEntry[];
  totalEntries: number;
  lastUpdated: string;
  type: LeaderboardType;
  timeframe: LeaderboardTimeframe;
}

export type LeaderboardType = 
  | 'global'       // All users
  | 'similar'      // Users with similar traits
  | 'friends'      // User's friends
  | 'focus'        // Specific focus area
  | 'challenge';   // Specific challenge

export type LeaderboardTimeframe = 
  | 'all_time'
  | 'monthly'
  | 'weekly'
  | 'daily';

export interface LeaderboardFilter {
  type?: LeaderboardType;
  timeframe?: LeaderboardTimeframe;
  focusArea?: string;
  challengeId?: string;
  limit?: number;
}
