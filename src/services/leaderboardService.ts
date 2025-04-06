/**
 * Leaderboard Service
 * 
 * This service handles the creation and management of challenge leaderboards.
 * It provides functions for generating mock leaderboard data and filtering entries.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  Leaderboard, 
  LeaderboardEntry, 
  LeaderboardType,
  LeaderboardTimeframe,
  LeaderboardFilter
} from '@/types/leaderboard';

// Sample usernames for mock data
const SAMPLE_USERNAMES = [
  'QuantumThinker', 'NeuralNinja', 'CognitiveExplorer', 'SynapticSage',
  'LogicLuminary', 'PatternPioneer', 'MindfulMaven', 'InsightArchitect',
  'CreativeCore', 'AnalyticalAce', 'IntuitionInnovator', 'EthicalEngineer',
  'StrategicSynapse', 'AdaptiveAlgorithm', 'ReasoningRenegade', 'ThoughtTitan',
  'BrainwaveBuilder', 'WisdomWeaver', 'ProblemPirate', 'ChallengeChampion'
];

// Sample avatar URLs for mock data
const SAMPLE_AVATARS = [
  '/assets/avatars/avatar-1.png',
  '/assets/avatars/avatar-2.png',
  '/assets/avatars/avatar-3.png',
  '/assets/avatars/avatar-4.png',
  '/assets/avatars/avatar-5.png',
  '/assets/avatars/avatar-6.png',
  '/assets/avatars/avatar-7.png',
  '/assets/avatars/avatar-8.png'
];

/**
 * Generates a mock leaderboard based on filter criteria
 */
export function generateMockLeaderboard(filter: LeaderboardFilter = {}): Leaderboard {
  const {
    type = 'global',
    timeframe = 'all_time',
    focusArea,
    challengeId,
    limit = 20
  } = filter;
  
  // Generate title based on filter
  let title = 'Global Leaderboard';
  let description = 'Top performers across all challenges';
  
  if (type === 'similar') {
    title = 'Similar Profiles Leaderboard';
    description = 'Top performers with traits similar to yours';
  } else if (type === 'friends') {
    title = 'Friends Leaderboard';
    description = 'See how your friends are performing';
  } else if (type === 'focus' && focusArea) {
    title = `${capitalizeFirstLetter(focusArea)} Focus Leaderboard`;
    description = `Top performers in ${focusArea} challenges`;
  } else if (type === 'challenge' && challengeId) {
    title = 'Challenge Leaderboard';
    description = 'Top performers for this specific challenge';
  }
  
  // Add timeframe to title
  if (timeframe !== 'all_time') {
    title += ` (${capitalizeFirstLetter(timeframe)})`;
  }
  
  // Generate mock entries
  const entries = generateMockEntries(limit, type, timeframe, focusArea);
  
  return {
    id: uuidv4(),
    title,
    description,
    entries,
    totalEntries: entries.length,
    lastUpdated: new Date().toISOString(),
    type,
    timeframe
  };
}

/**
 * Generates mock leaderboard entries
 */
function generateMockEntries(
  limit: number,
  type: LeaderboardType,
  timeframe: LeaderboardTimeframe,
  focusArea?: string
): LeaderboardEntry[] {
  // Generate random entries
  const entries: LeaderboardEntry[] = [];
  
  // Number of entries to generate (add some randomness)
  const entryCount = Math.min(limit, Math.floor(Math.random() * 10) + 15);
  
  // Generate entries
  for (let i = 0; i < entryCount; i++) {
    // Generate random score based on rank (higher ranks have higher scores)
    // Add some randomness to make it realistic
    const baseScore = 100 - (i * 2);
    const randomVariation = Math.floor(Math.random() * 5);
    const score = Math.max(50, Math.min(100, baseScore - randomVariation));
    
    // Generate random completion date based on timeframe
    const completedAt = generateRandomDate(timeframe);
    
    // Randomly select a focus area if not specified
    const entryFocusArea = focusArea || ['creative', 'analytical', 'emotional', 'ethical'][Math.floor(Math.random() * 4)];
    
    // Create entry
    entries.push({
      id: uuidv4(),
      userId: `user-${i + 1}`,
      username: SAMPLE_USERNAMES[i % SAMPLE_USERNAMES.length],
      avatarUrl: SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)],
      score,
      completedAt,
      focusArea: entryFocusArea,
      rank: i + 1,
      isCurrentUser: i === Math.floor(Math.random() * 5) // Randomly make one entry the current user
    });
  }
  
  // Sort by score (highest first)
  return entries.sort((a, b) => b.score - a.score);
}

/**
 * Generates a random date based on the timeframe
 */
function generateRandomDate(timeframe: LeaderboardTimeframe): string {
  const now = new Date();
  let date = new Date();
  
  switch (timeframe) {
    case 'daily':
      // Random time today
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      break;
    case 'weekly':
      // Random day this week
      date.setDate(now.getDate() - Math.floor(Math.random() * 7));
      break;
    case 'monthly':
      // Random day this month
      date.setDate(Math.floor(Math.random() * 28) + 1);
      break;
    case 'all_time':
      // Random date in the last year
      date.setDate(now.getDate() - Math.floor(Math.random() * 365));
      break;
  }
  
  return date.toISOString();
}

/**
 * Filters leaderboard entries based on criteria
 */
export function filterLeaderboardEntries(
  leaderboard: Leaderboard,
  filter: Partial<LeaderboardFilter>
): LeaderboardEntry[] {
  let filtered = [...leaderboard.entries];
  
  // Apply filters
  if (filter.focusArea) {
    filtered = filtered.filter(entry => entry.focusArea === filter.focusArea);
  }
  
  // Apply limit
  if (filter.limit && filter.limit > 0) {
    filtered = filtered.slice(0, filter.limit);
  }
  
  // Update ranks
  return filtered.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

/**
 * Gets the current user's rank from a leaderboard
 */
export function getCurrentUserRank(leaderboard: Leaderboard): number | null {
  const currentUserEntry = leaderboard.entries.find(entry => entry.isCurrentUser);
  return currentUserEntry?.rank || null;
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
