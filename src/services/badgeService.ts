/**
 * Badge Service
 * 
 * This service handles the creation, management, and unlocking of achievement badges.
 * It provides functions for checking unlock conditions and tracking badge progress.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  Badge, 
  BadgeCategory, 
  BadgeTier, 
  BadgeUnlockCondition,
  BadgeCollection
} from '@/types/badge';

// Define all available badges in the system
export const AVAILABLE_BADGES: Badge[] = [
  // Cognitive badges
  {
    id: 'cognitive-adaptability',
    name: 'Adaptive Thinker',
    description: 'Demonstrated exceptional adaptability in changing challenge scenarios',
    category: 'cognitive',
    tier: 'silver',
    icon: '🧠',
    requirement: 'Score above 80% in rounds with different focus areas',
    progress: 0
  },
  {
    id: 'cognitive-speed',
    name: 'Quick Processor',
    description: 'Completed challenges with exceptional speed while maintaining accuracy',
    category: 'cognitive',
    tier: 'gold',
    icon: '⚡',
    requirement: 'Complete any round with at least 70% score and 30+ seconds remaining',
    progress: 0
  },
  {
    id: 'cognitive-resilience',
    name: 'Mental Resilience',
    description: 'Showed improvement after initial setbacks',
    category: 'cognitive',
    tier: 'bronze',
    icon: '🛡️',
    requirement: 'Score higher in round 3 than in round 1 by at least 15%',
    progress: 0
  },
  
  // Creative badges
  {
    id: 'creative-innovator',
    name: 'Innovative Thinker',
    description: 'Demonstrated exceptional creative problem-solving abilities',
    category: 'creative',
    tier: 'gold',
    icon: '💡',
    requirement: 'Score above 85% in creative thinking challenges',
    progress: 0
  },
  {
    id: 'creative-connector',
    name: 'Pattern Connector',
    description: 'Excelled at connecting seemingly unrelated concepts',
    category: 'creative',
    tier: 'silver',
    icon: '🔄',
    requirement: 'Score above 80% in pattern recognition challenges',
    progress: 0
  },
  {
    id: 'creative-divergent',
    name: 'Divergent Thinker',
    description: 'Consistently generated multiple solution paths to challenges',
    category: 'creative',
    tier: 'bronze',
    icon: '🌟',
    requirement: 'Complete 3 creative challenges with different approaches',
    progress: 0
  },
  
  // Analytical badges
  {
    id: 'analytical-precision',
    name: 'Precision Analyzer',
    description: 'Demonstrated exceptional attention to detail in analytical tasks',
    category: 'analytical',
    tier: 'platinum',
    icon: '🔍',
    requirement: 'Score 95% or higher in any analytical challenge',
    progress: 0
  },
  {
    id: 'analytical-logic',
    name: 'Logic Master',
    description: 'Excelled at applying logical reasoning to complex problems',
    category: 'analytical',
    tier: 'gold',
    icon: '⚖️',
    requirement: 'Score above 85% in logical reasoning challenges',
    progress: 0
  },
  {
    id: 'analytical-efficiency',
    name: 'Efficiency Expert',
    description: 'Consistently found the most efficient solution paths',
    category: 'analytical',
    tier: 'silver',
    icon: '⏱️',
    requirement: 'Complete analytical challenges with at least 40% time remaining',
    progress: 0
  },
  
  // Social badges
  {
    id: 'social-rival-master',
    name: 'Rival Master',
    description: 'Consistently outperformed your AI rival across multiple challenges',
    category: 'social',
    tier: 'gold',
    icon: '🏆',
    requirement: 'Beat your rival in all three rounds of a game session',
    progress: 0
  },
  {
    id: 'social-underdog',
    name: 'Comeback Champion',
    description: 'Achieved victory despite initial disadvantages',
    category: 'social',
    tier: 'silver',
    icon: '🚀',
    requirement: 'Win overall despite losing the first round to your rival',
    progress: 0
  },
  {
    id: 'social-collaborator',
    name: 'AI Collaborator',
    description: 'Demonstrated balanced traits that work well with AI systems',
    category: 'social',
    tier: 'bronze',
    icon: '🤝',
    requirement: 'Have at least 3 traits with balanced scores (2-4 range)',
    progress: 0
  },
  
  // Achievement badges
  {
    id: 'achievement-perfect',
    name: 'Perfect Round',
    description: 'Achieved a perfect score in a challenge round',
    category: 'achievement',
    tier: 'platinum',
    icon: '💯',
    requirement: 'Score 100% in any round',
    progress: 0
  },
  {
    id: 'achievement-consistent',
    name: 'Consistency King',
    description: 'Maintained high performance across all challenge rounds',
    category: 'achievement',
    tier: 'gold',
    icon: '📊',
    requirement: 'Score at least 80% in all three rounds of a session',
    progress: 0
  },
  {
    id: 'achievement-explorer',
    name: 'Focus Explorer',
    description: 'Experimented with different focus areas across multiple sessions',
    category: 'achievement',
    tier: 'silver',
    icon: '🧭',
    requirement: 'Complete sessions with at least 3 different focus areas',
    progress: 0
  },
  
  // Mastery badges
  {
    id: 'mastery-cognitive',
    name: 'Cognitive Master',
    description: 'Achieved mastery across multiple cognitive domains',
    category: 'mastery',
    tier: 'platinum',
    icon: '👑',
    requirement: 'Unlock at least 5 cognitive or analytical badges',
    progress: 0,
    secret: true
  },
  {
    id: 'mastery-creative',
    name: 'Creative Virtuoso',
    description: 'Demonstrated exceptional creative abilities across multiple challenges',
    category: 'mastery',
    tier: 'platinum',
    icon: '🎨',
    requirement: 'Unlock at least 3 creative badges and score 90%+ in creative challenges',
    progress: 0,
    secret: true
  },
  {
    id: 'mastery-complete',
    name: 'Human Edge Master',
    description: 'Achieved comprehensive mastery of human-AI interaction',
    category: 'mastery',
    tier: 'platinum',
    icon: '🌟',
    requirement: 'Unlock at least 10 badges across all categories',
    progress: 0,
    secret: true
  }
];

/**
 * Checks if a badge should be unlocked based on game state
 */
export function checkBadgeUnlock(
  badge: Badge, 
  gameState: any, 
  rivalState: any
): { unlocked: boolean; progress: number } {
  // Default result
  let result = { unlocked: false, progress: badge.progress || 0 };
  
  // Check based on badge ID
  switch (badge.id) {
    // Cognitive badges
    case 'cognitive-adaptability':
      result = checkAdaptiveThinker(gameState);
      break;
    case 'cognitive-speed':
      result = checkQuickProcessor(gameState);
      break;
    case 'cognitive-resilience':
      result = checkMentalResilience(gameState);
      break;
      
    // Creative badges
    case 'creative-innovator':
      result = checkInnovativeThinker(gameState);
      break;
    case 'creative-connector':
      result = checkPatternConnector(gameState);
      break;
    case 'creative-divergent':
      result = checkDivergentThinker(gameState);
      break;
      
    // Analytical badges
    case 'analytical-precision':
      result = checkPrecisionAnalyzer(gameState);
      break;
    case 'analytical-logic':
      result = checkLogicMaster(gameState);
      break;
    case 'analytical-efficiency':
      result = checkEfficiencyExpert(gameState);
      break;
      
    // Social badges
    case 'social-rival-master':
      result = checkRivalMaster(gameState, rivalState);
      break;
    case 'social-underdog':
      result = checkComebackChampion(gameState, rivalState);
      break;
    case 'social-collaborator':
      result = checkAICollaborator(gameState);
      break;
      
    // Achievement badges
    case 'achievement-perfect':
      result = checkPerfectRound(gameState);
      break;
    case 'achievement-consistent':
      result = checkConsistencyKing(gameState);
      break;
    case 'achievement-explorer':
      result = checkFocusExplorer(gameState);
      break;
      
    // Mastery badges
    case 'mastery-cognitive':
      result = checkCognitiveMaster(gameState);
      break;
    case 'mastery-creative':
      result = checkCreativeVirtuoso(gameState);
      break;
    case 'mastery-complete':
      result = checkHumanEdgeMaster(gameState);
      break;
  }
  
  return result;
}

/**
 * Creates an initial badge collection for a new user
 */
export function createInitialBadgeCollection(userId: string): BadgeCollection {
  return {
    userId,
    unlockedBadges: [],
    inProgressBadges: AVAILABLE_BADGES.filter(badge => !badge.secret).map(badge => ({
      ...badge,
      progress: 0
    })),
    totalBadges: AVAILABLE_BADGES.length,
    totalUnlocked: 0
  };
}

/**
 * Updates badge progress and checks for newly unlocked badges
 */
export function updateBadgeProgress(
  collection: BadgeCollection,
  gameState: any,
  rivalState: any
): { 
  updatedCollection: BadgeCollection; 
  newlyUnlocked: Badge[] 
} {
  const newlyUnlocked: Badge[] = [];
  
  // Process in-progress badges
  const updatedInProgress = collection.inProgressBadges.filter(badge => {
    const { unlocked, progress } = checkBadgeUnlock(badge, gameState, rivalState);
    
    // Update badge progress
    badge.progress = progress;
    
    if (unlocked) {
      // Badge is now unlocked
      badge.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(badge);
      return false; // Remove from in-progress
    }
    
    return true; // Keep in in-progress
  });
  
  // Check if any secret badges should be revealed and added to in-progress
  const secretBadgesToReveal = AVAILABLE_BADGES.filter(badge => 
    badge.secret && 
    !collection.unlockedBadges.some(b => b.id === badge.id) &&
    !updatedInProgress.some(b => b.id === badge.id) &&
    shouldRevealSecretBadge(badge, collection, gameState)
  );
  
  // Updated collection
  const updatedCollection: BadgeCollection = {
    ...collection,
    unlockedBadges: [...collection.unlockedBadges, ...newlyUnlocked],
    inProgressBadges: [...updatedInProgress, ...secretBadgesToReveal],
    totalUnlocked: collection.unlockedBadges.length + newlyUnlocked.length
  };
  
  return { updatedCollection, newlyUnlocked };
}

/**
 * Determines if a secret badge should be revealed based on progress
 */
function shouldRevealSecretBadge(
  badge: Badge,
  collection: BadgeCollection,
  gameState: any
): boolean {
  switch (badge.id) {
    case 'mastery-cognitive':
      // Reveal after unlocking 2 cognitive or analytical badges
      return collection.unlockedBadges.filter(
        b => b.category === 'cognitive' || b.category === 'analytical'
      ).length >= 2;
      
    case 'mastery-creative':
      // Reveal after unlocking 1 creative badge
      return collection.unlockedBadges.filter(
        b => b.category === 'creative'
      ).length >= 1;
      
    case 'mastery-complete':
      // Reveal after unlocking 5 badges total
      return collection.unlockedBadges.length >= 5;
      
    default:
      return false;
  }
}

// Individual badge check functions

function checkAdaptiveThinker(gameState: any): { unlocked: boolean; progress: number } {
  // Check if user scored above 80% in rounds with different focus areas
  const roundResults = gameState.roundResults;
  const focusAreas = new Set();
  let highScoreCount = 0;
  let totalRounds = 0;
  
  // Count rounds with different focus areas and high scores
  Object.entries(roundResults).forEach(([round, result]: [string, any]) => {
    if (result && result.focusArea) {
      focusAreas.add(result.focusArea);
      totalRounds++;
      
      if (result.score >= 80) {
        highScoreCount++;
      }
    }
  });
  
  // Calculate progress
  const progress = focusAreas.size > 0 
    ? Math.min(100, (highScoreCount / focusAreas.size) * 100)
    : 0;
    
  // Unlocked if scored 80%+ in at least 2 different focus areas
  const unlocked = focusAreas.size >= 2 && highScoreCount >= 2;
  
  return { unlocked, progress };
}

function checkQuickProcessor(gameState: any): { unlocked: boolean; progress: number } {
  // Check if completed any round with at least 70% score and 30+ seconds remaining
  const roundResults = gameState.roundResults;
  let bestTimeRemaining = 0;
  let bestScore = 0;
  
  // Find the best round with high score and time remaining
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.score >= 70 && result.timeRemaining > bestTimeRemaining) {
      bestTimeRemaining = result.timeRemaining;
      bestScore = result.score;
    }
  });
  
  // Calculate progress (based on how close to meeting criteria)
  const timeProgress = Math.min(100, (bestTimeRemaining / 30) * 100);
  const scoreProgress = bestScore >= 70 ? 100 : (bestScore / 70) * 100;
  const progress = Math.min(timeProgress, scoreProgress);
  
  // Unlocked if any round has 70%+ score with 30+ seconds remaining
  const unlocked = bestScore >= 70 && bestTimeRemaining >= 30;
  
  return { unlocked, progress };
}

function checkMentalResilience(gameState: any): { unlocked: boolean; progress: number } {
  // Check if score in round 3 is higher than round 1 by at least 15%
  const round1 = gameState.roundResults.round1;
  const round3 = gameState.roundResults.round3;
  
  if (!round1 || !round3) {
    return { unlocked: false, progress: 0 };
  }
  
  const scoreDifference = round3.score - round1.score;
  
  // Calculate progress (based on improvement percentage)
  const progress = Math.min(100, (scoreDifference / 15) * 100);
  
  // Unlocked if round 3 score is at least 15% higher than round 1
  const unlocked = scoreDifference >= 15;
  
  return { unlocked, progress };
}

function checkInnovativeThinker(gameState: any): { unlocked: boolean; progress: number } {
  // Check if scored above 85% in creative thinking challenges
  const roundResults = gameState.roundResults;
  let creativeScores: number[] = [];
  
  // Find creative thinking challenges
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.focusArea === 'creative') {
      creativeScores.push(result.score);
    }
  });
  
  // Calculate average score in creative challenges
  const avgScore = creativeScores.length > 0
    ? creativeScores.reduce((sum, score) => sum + score, 0) / creativeScores.length
    : 0;
    
  // Calculate progress
  const progress = Math.min(100, (avgScore / 85) * 100);
  
  // Unlocked if average score in creative challenges is 85%+
  const unlocked = avgScore >= 85 && creativeScores.length > 0;
  
  return { unlocked, progress };
}

function checkPatternConnector(gameState: any): { unlocked: boolean; progress: number } {
  // Check if scored above 80% in pattern recognition challenges
  const roundResults = gameState.roundResults;
  let patternScores: number[] = [];
  
  // Find pattern recognition challenges (typically round 1)
  Object.entries(roundResults).forEach(([round, result]: [string, any]) => {
    if (round === 'round1' && result) {
      patternScores.push(result.score);
    }
  });
  
  // Calculate average score in pattern challenges
  const avgScore = patternScores.length > 0
    ? patternScores.reduce((sum, score) => sum + score, 0) / patternScores.length
    : 0;
    
  // Calculate progress
  const progress = Math.min(100, (avgScore / 80) * 100);
  
  // Unlocked if average score in pattern challenges is 80%+
  const unlocked = avgScore >= 80 && patternScores.length > 0;
  
  return { unlocked, progress };
}

function checkDivergentThinker(gameState: any): { unlocked: boolean; progress: number } {
  // This would require tracking different approaches to challenges
  // For now, we'll use a simplified version based on completing creative challenges
  const roundResults = gameState.roundResults;
  let creativeRounds = 0;
  
  // Count completed creative challenges
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.focusArea === 'creative' && result.completed) {
      creativeRounds++;
    }
  });
  
  // Calculate progress
  const progress = Math.min(100, (creativeRounds / 3) * 100);
  
  // Unlocked if completed 3 creative challenges
  const unlocked = creativeRounds >= 3;
  
  return { unlocked, progress };
}

function checkPrecisionAnalyzer(gameState: any): { unlocked: boolean; progress: number } {
  // Check if scored 95% or higher in any analytical challenge
  const roundResults = gameState.roundResults;
  let bestAnalyticalScore = 0;
  
  // Find highest score in analytical challenges
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.focusArea === 'analytical' && result.score > bestAnalyticalScore) {
      bestAnalyticalScore = result.score;
    }
  });
  
  // Calculate progress
  const progress = Math.min(100, (bestAnalyticalScore / 95) * 100);
  
  // Unlocked if any analytical challenge has 95%+ score
  const unlocked = bestAnalyticalScore >= 95;
  
  return { unlocked, progress };
}

function checkLogicMaster(gameState: any): { unlocked: boolean; progress: number } {
  // Check if scored above 85% in logical reasoning challenges
  const roundResults = gameState.roundResults;
  let logicalScores: number[] = [];
  
  // Find logical reasoning challenges
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.focusArea === 'analytical') {
      logicalScores.push(result.score);
    }
  });
  
  // Calculate average score in logical challenges
  const avgScore = logicalScores.length > 0
    ? logicalScores.reduce((sum, score) => sum + score, 0) / logicalScores.length
    : 0;
    
  // Calculate progress
  const progress = Math.min(100, (avgScore / 85) * 100);
  
  // Unlocked if average score in logical challenges is 85%+
  const unlocked = avgScore >= 85 && logicalScores.length > 0;
  
  return { unlocked, progress };
}

function checkEfficiencyExpert(gameState: any): { unlocked: boolean; progress: number } {
  // Check if completed analytical challenges with at least 40% time remaining
  const roundResults = gameState.roundResults;
  let bestTimePercentage = 0;
  
  // Find analytical challenges with highest time remaining percentage
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.focusArea === 'analytical') {
      const timePercentage = (result.timeRemaining / 60) * 100; // Assuming 60 seconds total
      if (timePercentage > bestTimePercentage) {
        bestTimePercentage = timePercentage;
      }
    }
  });
  
  // Calculate progress
  const progress = Math.min(100, (bestTimePercentage / 40) * 100);
  
  // Unlocked if any analytical challenge has 40%+ time remaining
  const unlocked = bestTimePercentage >= 40;
  
  return { unlocked, progress };
}

function checkRivalMaster(gameState: any, rivalState: any): { unlocked: boolean; progress: number } {
  // Check if beat rival in all three rounds
  if (!rivalState.currentRival) {
    return { unlocked: false, progress: 0 };
  }
  
  const roundResults = gameState.roundResults;
  const rivalPerformance = rivalState.currentRival.performance;
  
  let winsCount = 0;
  let totalRounds = 0;
  
  // Count rounds where user beat the rival
  ['round1', 'round2', 'round3'].forEach(round => {
    const userScore = roundResults[round]?.score;
    const rivalScore = rivalPerformance[round];
    
    if (userScore !== undefined && rivalScore !== undefined) {
      totalRounds++;
      if (userScore > rivalScore) {
        winsCount++;
      }
    }
  });
  
  // Calculate progress
  const progress = totalRounds > 0 ? Math.min(100, (winsCount / 3) * 100) : 0;
  
  // Unlocked if won all three rounds against rival
  const unlocked = winsCount === 3 && totalRounds === 3;
  
  return { unlocked, progress };
}

function checkComebackChampion(gameState: any, rivalState: any): { unlocked: boolean; progress: number } {
  // Check if won overall despite losing first round to rival
  if (!rivalState.currentRival) {
    return { unlocked: false, progress: 0 };
  }
  
  const roundResults = gameState.roundResults;
  const rivalPerformance = rivalState.currentRival.performance;
  
  // Check if lost first round
  const lostFirstRound = 
    roundResults.round1?.score !== undefined && 
    rivalPerformance.round1 !== undefined &&
    roundResults.round1.score < rivalPerformance.round1;
    
  if (!lostFirstRound) {
    return { unlocked: false, progress: 0 };
  }
  
  // Calculate average scores for overall comparison
  const userRounds = [
    roundResults.round1?.score, 
    roundResults.round2?.score, 
    roundResults.round3?.score
  ].filter(Boolean) as number[];
  
  const rivalRounds = [
    rivalPerformance.round1, 
    rivalPerformance.round2, 
    rivalPerformance.round3
  ].filter(Boolean) as number[];
  
  if (userRounds.length < 3 || rivalRounds.length < 3) {
    return { unlocked: false, progress: 50 }; // 50% progress for losing first round
  }
  
  const userAvg = userRounds.reduce((sum, score) => sum + score, 0) / userRounds.length;
  const rivalAvg = rivalRounds.reduce((sum, score) => sum + score, 0) / rivalRounds.length;
  
  // Calculate progress
  const progress = lostFirstRound ? Math.min(100, 50 + ((userAvg - rivalAvg) / 10) * 50) : 0;
  
  // Unlocked if lost first round but won overall
  const unlocked = lostFirstRound && userAvg > rivalAvg;
  
  return { unlocked, progress };
}

function checkAICollaborator(gameState: any): { unlocked: boolean; progress: number } {
  // Check if have at least 3 traits with balanced scores (2-4 range)
  const traits = gameState.traits || [];
  
  let balancedTraits = 0;
  
  // Count traits with balanced scores
  traits.forEach((trait: any) => {
    if (trait.score >= 2 && trait.score <= 4) {
      balancedTraits++;
    }
  });
  
  // Calculate progress
  const progress = Math.min(100, (balancedTraits / 3) * 100);
  
  // Unlocked if at least 3 traits have balanced scores
  const unlocked = balancedTraits >= 3;
  
  return { unlocked, progress };
}

function checkPerfectRound(gameState: any): { unlocked: boolean; progress: number } {
  // Check if scored 100% in any round
  const roundResults = gameState.roundResults;
  let bestScore = 0;
  
  // Find highest score in any round
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.score > bestScore) {
      bestScore = result.score;
    }
  });
  
  // Calculate progress
  const progress = bestScore;
  
  // Unlocked if any round has 100% score
  const unlocked = bestScore === 100;
  
  return { unlocked, progress };
}

function checkConsistencyKing(gameState: any): { unlocked: boolean; progress: number } {
  // Check if scored at least 80% in all three rounds
  const roundResults = gameState.roundResults;
  let roundsAbove80 = 0;
  let totalRounds = 0;
  
  // Count rounds with scores above 80%
  ['round1', 'round2', 'round3'].forEach(round => {
    if (roundResults[round]?.score !== undefined) {
      totalRounds++;
      if (roundResults[round].score >= 80) {
        roundsAbove80++;
      }
    }
  });
  
  // Calculate progress
  const progress = totalRounds > 0 ? Math.min(100, (roundsAbove80 / 3) * 100) : 0;
  
  // Unlocked if all three rounds have 80%+ scores
  const unlocked = roundsAbove80 === 3 && totalRounds === 3;
  
  return { unlocked, progress };
}

function checkFocusExplorer(gameState: any): { unlocked: boolean; progress: number } {
  // This would require tracking focus areas across multiple sessions
  // For now, we'll use a simplified version based on the current session
  const focusAreas = new Set();
  
  // Add current focus area
  if (gameState.selectedFocus?.id) {
    focusAreas.add(gameState.selectedFocus.id);
  }
  
  // Add focus areas from history if available
  if (gameState.focusHistory) {
    gameState.focusHistory.forEach((focus: any) => {
      if (focus.id) {
        focusAreas.add(focus.id);
      }
    });
  }
  
  // Calculate progress
  const progress = Math.min(100, (focusAreas.size / 3) * 100);
  
  // Unlocked if tried at least 3 different focus areas
  const unlocked = focusAreas.size >= 3;
  
  return { unlocked, progress };
}

function checkCognitiveMaster(gameState: any): { unlocked: boolean; progress: number } {
  // This would require tracking unlocked badges
  // For now, we'll use a simplified version based on cognitive trait scores
  const traits = gameState.traits || [];
  
  let highCognitiveTraits = 0;
  
  // Count cognitive traits with high scores
  traits.forEach((trait: any) => {
    if (['adaptability', 'autonomy'].includes(trait.id) && trait.score >= 4) {
      highCognitiveTraits++;
    }
  });
  
  // Calculate progress
  const progress = Math.min(100, (highCognitiveTraits / 2) * 100);
  
  // Unlocked if at least 2 cognitive traits have high scores
  const unlocked = highCognitiveTraits >= 2;
  
  return { unlocked, progress };
}

function checkCreativeVirtuoso(gameState: any): { unlocked: boolean; progress: number } {
  // This would require tracking unlocked badges
  // For now, we'll use a simplified version based on creative challenge scores
  const roundResults = gameState.roundResults;
  let creativeScores: number[] = [];
  
  // Find creative thinking challenges
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.focusArea === 'creative') {
      creativeScores.push(result.score);
    }
  });
  
  // Calculate average score in creative challenges
  const avgScore = creativeScores.length > 0
    ? creativeScores.reduce((sum, score) => sum + score, 0) / creativeScores.length
    : 0;
    
  // Calculate progress
  const progress = Math.min(100, (avgScore / 90) * 100);
  
  // Unlocked if average score in creative challenges is 90%+
  const unlocked = avgScore >= 90 && creativeScores.length > 0;
  
  return { unlocked, progress };
}

function checkHumanEdgeMaster(gameState: any): { unlocked: boolean; progress: number } {
  // This would require tracking unlocked badges
  // For now, we'll use a simplified version based on overall performance
  const roundResults = gameState.roundResults;
  let completedRounds = 0;
  let totalScore = 0;
  
  // Calculate overall performance
  Object.values(roundResults).forEach((result: any) => {
    if (result && result.score !== undefined) {
      completedRounds++;
      totalScore += result.score;
    }
  });
  
  const avgScore = completedRounds > 0 ? totalScore / completedRounds : 0;
  
  // Calculate progress
  const progress = Math.min(100, (avgScore / 85) * 100);
  
  // Unlocked if average score across all rounds is 85%+ and completed all rounds
  const unlocked = avgScore >= 85 && completedRounds >= 3;
  
  return { unlocked, progress };
}
