"use client";

import React, { useEffect } from 'react';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import { useRivalStore } from '@/store/rival-store';
import { useBadgeStore } from '@/store/badge-store';
import { useLeaderboardStore } from '@/store/leaderboard-store';
import { useNetworkStore } from '@/store/network-store';
import { BadgeNotification } from '@/components/badges/BadgeNotification';
import GamePhaseNavigator from './GamePhaseNavigator';

/**
 * GameIntegration component
 * 
 * This component handles the integration of all game features:
 * - AI Rival System
 * - Achievement Badge System
 * - Challenge Leaderboards
 * - Neural Network Progression
 * 
 * It monitors game state changes and updates all systems accordingly.
 */
export function GameIntegration() {
  // Get game state from the new useGameStore
  const gamePhase = useGameStore(state => state.gamePhase);
  const responses = useGameStore(state => state.responses);
  
  // Use a default user ID
  const userId = 'default-user';
  
  // Get rival state
  const rivalName = useRivalStore(state => state.currentRival?.name);
  
  // Get badge state
  const initializeBadges = useBadgeStore(state => state.initializeBadges);
  const updateBadges = useBadgeStore(state => state.updateBadges);
  const recentlyUnlocked = useBadgeStore(state => state.recentlyUnlocked);
  const clearRecentlyUnlocked = useBadgeStore(state => state.clearRecentlyUnlocked);
  
  // Get leaderboard state
  const updateUserScore = useLeaderboardStore(state => state.updateUserScore);
  
  // Get network state
  const initializeNetwork = useNetworkStore(state => state.initializeNetwork);
  const updateNetworkFromGame = useNetworkStore(state => state.updateNetworkFromGame);
  
  // Initialize systems when game starts
  useEffect(() => {
    if (userId) {
      initializeBadges(userId);
      initializeNetwork(userId);
    }
  }, [userId, initializeBadges, initializeNetwork]);
  
  // Update systems when round results change
  useEffect(() => {
    // Check if any round is completed
    const hasRound1 = !!responses.round1?.userResponse;
    const hasRound2 = !!responses.round2?.userResponse;
    const hasRound3 = !!responses.round3?.userResponse;
    
    const hasCompletedRound = hasRound1 || hasRound2 || hasRound3;
    
    if (hasCompletedRound) {
      // Update badges with selected game and rival state
      const gameStateCopy = useGameStore.getState();
      const rivalStateCopy = useRivalStore.getState();
      updateBadges(gameStateCopy, rivalStateCopy);
      
      // Update leaderboard with latest scores - using mock scores for now
      if (hasRound1) {
        updateUserScore('round1', 75);
      }
      if (hasRound2) {
        updateUserScore('round2', 85);
      }
      if (hasRound3) {
        updateUserScore('round3', 95);
      }
      
      // Update neural network
      updateNetworkFromGame(gameStateCopy, rivalStateCopy);
    }
  }, [responses, updateBadges, updateUserScore, updateNetworkFromGame]);
  
  // Handle badge notifications
  const [currentBadge, ...remainingBadges] = recentlyUnlocked;
  
  const handleBadgeNotificationClose = () => {
    clearRecentlyUnlocked();
  };
  
  return (
    <>
      {/* Game Phase Navigator - handles routing based on game phase changes */}
      <GamePhaseNavigator />
      
      {/* Badge notifications */}
      {currentBadge && (
        <BadgeNotification 
          badge={currentBadge} 
          onClose={handleBadgeNotificationClose} 
        />
      )}
    </>
  );
}
