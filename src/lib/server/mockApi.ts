/**
 * Mock API endpoints for the game features
 * 
 * This file provides mock API endpoints for:
 * - AI Rival System
 * - Achievement Badge System
 * - Challenge Leaderboards
 * - Neural Network Progression
 */

import { v4 as uuidv4 } from 'uuid';
import { Rival } from '@/types/rival';
import { Badge, BadgeCollection } from '@/types/badge';
import { Leaderboard, LeaderboardEntry, LeaderboardFilter } from '@/types/leaderboard';
import { NeuralNetwork, NetworkStats } from '@/types/network';

/**
 * Mock API class with endpoints for all game features
 */
export class MockAPI {
  // Base URL for API endpoints
  private static baseUrl = '/api';
  
  /**
   * AI Rival System Endpoints
   */
  
  // Generate a new AI rival based on user traits
  static async generateRival(userTraits: any[], focusArea?: string, difficultyLevel: string = 'medium'): Promise<Rival> {
    console.log('API: Generating rival with traits:', userTraits, 'focus:', focusArea, 'difficulty:', difficultyLevel);
    
    // In a real implementation, this would make an API call
    // For now, simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Import the rival service to generate a mock rival
    const { generateRival } = await import('@/services/rivalService');
    
    // Generate a rival using the service
    return generateRival({
      userTraits: userTraits.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        value: t.score
      })),
      focusArea,
      difficultyLevel: difficultyLevel as any,
      rivalryStyle: 'competitive'
    });
  }
  
  // Update rival performance after a round
  static async updateRivalPerformance(rivalId: string, roundKey: string, score: number): Promise<Rival> {
    console.log('API: Updating rival performance:', rivalId, roundKey, score);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would update the rival in a database
    // For now, return a mock response
    return {
      id: rivalId,
      performance: {
        [roundKey]: score
      }
    } as any;
  }
  
  // Get rival details
  static async getRival(rivalId: string): Promise<Rival> {
    console.log('API: Getting rival details:', rivalId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would fetch the rival from a database
    // For now, return a mock response
    return {
      id: rivalId,
      name: 'Mock Rival',
      personalityType: 'Analytical Challenger',
      description: 'A mock rival for testing purposes',
      traits: [],
      strengths: ['Logic', 'Analysis'],
      weaknesses: ['Creativity', 'Intuition'],
      encouragementMessages: ['Good job!'],
      tauntMessages: ['Better luck next time!'],
      predictions: {
        round1: 75,
        round2: 80,
        round3: 85
      },
      performance: {
        round1: 70,
        round2: 75,
        round3: 80
      }
    } as any;
  }
  
  /**
   * Achievement Badge System Endpoints
   */
  
  // Get user's badge collection
  static async getBadgeCollection(userId: string): Promise<BadgeCollection> {
    console.log('API: Getting badge collection for user:', userId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Import the badge service to generate a mock collection
    const { createInitialBadgeCollection } = await import('@/services/badgeService');
    
    // Create a badge collection using the service
    return createInitialBadgeCollection(userId);
  }
  
  // Check for newly unlocked badges
  static async checkBadgeUnlocks(userId: string, gameState: any): Promise<Badge[]> {
    console.log('API: Checking badge unlocks for user:', userId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // In a real implementation, this would check badge unlock conditions on the server
    // For now, return a mock response with no new badges
    return [];
  }
  
  // Update badge progress
  static async updateBadgeProgress(userId: string, badgeId: string, progress: number): Promise<Badge> {
    console.log('API: Updating badge progress:', userId, badgeId, progress);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would update the badge in a database
    // For now, return a mock response
    return {
      id: badgeId,
      progress
    } as any;
  }
  
  /**
   * Challenge Leaderboards Endpoints
   */
  
  // Get leaderboard data
  static async getLeaderboard(filter: LeaderboardFilter): Promise<Leaderboard> {
    console.log('API: Getting leaderboard with filter:', filter);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Import the leaderboard service to generate mock data
    const { generateMockLeaderboard } = await import('@/services/leaderboardService');
    
    // Generate a leaderboard using the service
    return generateMockLeaderboard(filter);
  }
  
  // Submit score to leaderboard
  static async submitScore(userId: string, challengeId: string, score: number): Promise<LeaderboardEntry> {
    console.log('API: Submitting score:', userId, challengeId, score);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // In a real implementation, this would add the score to a leaderboard in a database
    // For now, return a mock response
    return {
      id: uuidv4(),
      userId,
      username: 'Current User',
      score,
      completedAt: new Date().toISOString(),
      rank: 1,
      isCurrentUser: true
    };
  }
  
  // Get user's leaderboard position
  static async getUserLeaderboardPosition(userId: string, leaderboardId: string): Promise<number> {
    console.log('API: Getting user leaderboard position:', userId, leaderboardId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would fetch the user's position from a database
    // For now, return a random position between 1 and 20
    return Math.floor(Math.random() * 20) + 1;
  }
  
  /**
   * Neural Network Progression Endpoints
   */
  
  // Get user's neural network
  static async getNeuralNetwork(userId: string): Promise<NeuralNetwork> {
    console.log('API: Getting neural network for user:', userId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Import the network service to generate a mock network
    const { createInitialNetwork } = await import('@/services/networkService');
    
    // Create a network using the service
    return createInitialNetwork(userId);
  }
  
  // Update neural network after game results
  static async updateNeuralNetwork(userId: string, gameState: any): Promise<NeuralNetwork> {
    console.log('API: Updating neural network for user:', userId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would update the network in a database
    // For now, return a mock response with the initial network
    const { createInitialNetwork } = await import('@/services/networkService');
    const network = createInitialNetwork(userId);
    
    // Simulate some progress
    network.overallLevel = Math.min(10, network.overallLevel + 1);
    network.nodes = network.nodes.map(node => ({
      ...node,
      level: Math.min(10, node.level + 1),
      progress: Math.floor(Math.random() * 100)
    }));
    
    return network;
  }
  
  // Get neural network statistics
  static async getNetworkStats(userId: string): Promise<NetworkStats> {
    console.log('API: Getting network stats for user:', userId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Import the network service to calculate stats
    const { createInitialNetwork, calculateNetworkStats } = await import('@/services/networkService');
    
    // Create a network and calculate stats
    const network = createInitialNetwork(userId);
    return calculateNetworkStats(network);
  }
}
