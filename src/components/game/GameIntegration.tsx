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
  const responses = useGameStore(state => state.responses || {});
  
  // Use a default user ID
  const userId = 'default-user';
  
  // Get rival state
  const rivalName = useRivalStore(state => state.currentRival?.name);
  
  // Get badge state
  const initializeBadges = useBadgeStore(state => state.initializeBadges);
  const updateBadges = useBadgeStore(state => state.updateBadges);
  const recentlyUnlocked = useBadgeStore(state => state.recentlyUnlocked || []);
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
    // Check if responses is defined before accessing properties
    if (!responses) return;
    
    // Check if any round is completed
    const hasRound1 = !!(responses.round1 && responses.round1.userResponse);
    const hasRound2 = !!(responses.round2 && responses.round2.userResponse);
    const hasRound3 = !!(responses.round3 && responses.round3.userResponse);
    
    const hasCompletedRound = hasRound1 || hasRound2 || hasRound3;
    
    if (hasCompletedRound) {
      try {
        // Update badges with selected game and rival state
        const gameStateCopy = useGameStore.getState();
        const rivalStateCopy = useRivalStore.getState();
        
        // Create a properly formatted game state object for the badge service
        const formattedGameState = {
          currentStep: gameStateCopy.gamePhase, // Map to the expected property name
          roundResults: gameStateCopy.responses || {}, // Map to the expected property name
          personality: gameStateCopy.personality || {},
          focus: gameStateCopy.focus || null,
          // Add any other properties needed by badge service
        };
        
        // Ensure both state objects exist before updating
        if (gameStateCopy && rivalStateCopy) {
          // Pass the formatted game state to updateBadges
          updateBadges(formattedGameState, rivalStateCopy);
          
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
          
          // Update neural network with formatted game state
          updateNetworkFromGame(formattedGameState, rivalStateCopy);
        }
      } catch (error) {
        console.error('Error updating game systems:', error);
        // Gracefully handle the error without breaking the UI
      }
    }
  }, [responses, updateBadges, updateUserScore, updateNetworkFromGame]);
  
  // Handle badge notifications - ensure recentlyUnlocked is an array
  const [currentBadge, ...remainingBadges] = Array.isArray(recentlyUnlocked) ? recentlyUnlocked : [];
  
  const handleBadgeNotificationClose = () => {
    if (clearRecentlyUnlocked) {
      try {
        clearRecentlyUnlocked();
      } catch (error) {
        console.error('Error clearing badge notifications:', error);
      }
    }
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
