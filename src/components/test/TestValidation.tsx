'use client';

import React, { useEffect } from 'react';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import { useRivalStore } from '@/store/rival-store';
import { useBadgeStore } from '@/store/badge-store';
import { useLeaderboardStore } from '@/store/leaderboard-store';
import { useNetworkStore } from '@/store/network-store';
import { MockAPI } from '@/lib/server/mockApi';

/**
 * Test component to validate all implemented features
 * This component tests:
 * - AI Rival System
 * - Achievement Badge System
 * - Challenge Leaderboards
 * - Neural Network Progression
 */
export function TestValidation() {
  // Get stores
  const gameState = useGameStore();
  const rivalState = useRivalStore();
  const badgeState = useBadgeStore();
  const leaderboardState = useLeaderboardStore();
  const networkState = useNetworkStore();
  
  // Test initialization
  useEffect(() => {
    const runTests = async () => {
      console.log('=== STARTING VALIDATION TESTS ===');
      
      // Test user ID
      const userId = 'test-user-' + Math.floor(Math.random() * 1000);
      console.log('Test user ID:', userId);
      
      try {
        // Test AI Rival System
        console.log('\n--- Testing AI Rival System ---');
        const mockTraits = [
          { id: 'adaptability', name: 'Adaptability', description: 'Ability to adapt', score: 4 },
          { id: 'creativity', name: 'Creativity', description: 'Creative thinking', score: 3 },
          { id: 'logic', name: 'Logic', description: 'Logical reasoning', score: 5 }
        ];
        
        const rival = await MockAPI.generateRival(mockTraits, 'creative', 'medium');
        console.log('Generated rival:', rival.name);
        console.log('Rival traits count:', rival.traits.length);
        console.log('Rival personality:', rival.personalityType);
        
        // Test updating rival performance
        const updatedRival = await MockAPI.updateRivalPerformance(rival.id, 'round1', 85);
        console.log('Updated rival performance for round1:', updatedRival.performance?.round1);
        
        // Test Achievement Badge System
        console.log('\n--- Testing Achievement Badge System ---');
        const badgeCollection = await MockAPI.getBadgeCollection(userId);
        console.log('Badge collection total badges:', badgeCollection.totalBadges);
        console.log('Badge collection unlocked badges:', badgeCollection.unlockedBadges.length);
        console.log('Badge collection in-progress badges:', badgeCollection.inProgressBadges.length);
        
        // Test checking badge unlocks
        const unlockedBadges = await MockAPI.checkBadgeUnlocks(userId, {
          roundResults: {
            round1: { score: 95, completed: true }
          }
        });
        console.log('Checked for unlocked badges, count:', unlockedBadges.length);
        
        // Test updating badge progress
        const updatedBadge = await MockAPI.updateBadgeProgress(userId, 'cognitive-speed', 75);
        console.log('Updated badge progress:', updatedBadge.progress);
        
        // Test Challenge Leaderboards
        console.log('\n--- Testing Challenge Leaderboards ---');
        const leaderboard = await MockAPI.getLeaderboard({
          type: 'global',
          timeframe: 'weekly',
          limit: 10
        });
        console.log('Leaderboard title:', leaderboard.title);
        console.log('Leaderboard entries count:', leaderboard.entries.length);
        
        // Test submitting score to leaderboard
        const leaderboardEntry = await MockAPI.submitScore(userId, 'round1', 92);
        console.log('Submitted score to leaderboard, rank:', leaderboardEntry.rank);
        
        // Test getting user's leaderboard position
        const position = await MockAPI.getUserLeaderboardPosition(userId, leaderboard.id);
        console.log('User leaderboard position:', position);
        
        // Test Neural Network Progression
        console.log('\n--- Testing Neural Network Progression ---');
        const network = await MockAPI.getNeuralNetwork(userId);
        console.log('Neural network nodes count:', network.nodes.length);
        console.log('Neural network connections count:', network.connections.length);
        console.log('Neural network overall level:', network.overallLevel);
        
        // Test updating neural network
        const updatedNetwork = await MockAPI.updateNeuralNetwork(userId, {
          roundResults: {
            round1: { score: 90, completed: true },
            round2: { score: 85, completed: true }
          }
        });
        console.log('Updated network overall level:', updatedNetwork.overallLevel);
        
        // Test getting network stats
        const networkStats = await MockAPI.getNetworkStats(userId);
        console.log('Network stats dominant domain:', networkStats.dominantDomain);
        console.log('Network stats weakest domain:', networkStats.weakestDomain);
        console.log('Network stats unlocked nodes:', networkStats.unlockedNodes);
        
        console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
      } catch (error) {
        console.error('Test failed:', error);
      }
    };
    
    runTests();
  }, []);
  
  return (
    <div className="test-validation p-6">
      <h1 className="text-2xl font-bold mb-4">Validation Tests</h1>
      <p>Check the console for test results.</p>
      
      <div className="mt-6 space-y-4">
        <h2 className="text-xl font-semibold">Store States</h2>
        
        <div className="glass p-4 rounded-lg">
          <h3 className="font-medium mb-2">Game Store</h3>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify({
              gamePhase: gameState.gamePhase,
              personality: gameState.personality?.traits?.length || 0,
              focus: gameState.focus?.id,
              responses: Object.keys(gameState.responses || {})
            }, null, 2)}
          </pre>
        </div>
        
        <div className="glass p-4 rounded-lg">
          <h3 className="font-medium mb-2">Rival Store</h3>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify({
              hasRival: !!rivalState.currentRival,
              rivalName: rivalState.currentRival?.name,
              rivalPersonality: rivalState.currentRival?.personalityType,
              rivalTraits: rivalState.currentRival?.traits.length
            }, null, 2)}
          </pre>
        </div>
        
        <div className="glass p-4 rounded-lg">
          <h3 className="font-medium mb-2">Badge Store</h3>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify({
              totalBadges: badgeState.badgeCollection?.totalBadges,
              unlockedBadges: badgeState.badgeCollection?.unlockedBadges.length,
              inProgressBadges: badgeState.badgeCollection?.inProgressBadges.length,
              recentlyUnlocked: badgeState.recentlyUnlocked.length
            }, null, 2)}
          </pre>
        </div>
        
        <div className="glass p-4 rounded-lg">
          <h3 className="font-medium mb-2">Leaderboard Store</h3>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify({
              leaderboardsCount: Object.keys(leaderboardState.leaderboards).length,
              userBestScores: leaderboardState.userBestScores,
              currentFilter: leaderboardState.currentFilter
            }, null, 2)}
          </pre>
        </div>
        
        <div className="glass p-4 rounded-lg">
          <h3 className="font-medium mb-2">Network Store</h3>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify({
              hasNetwork: !!networkState.network,
              overallLevel: networkState.network?.overallLevel,
              nodesCount: networkState.network?.nodes.length,
              unlockedNodes: networkState.network?.nodes.filter(n => n.unlocked).length,
              visualizationMode: networkState.visualizationMode
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
