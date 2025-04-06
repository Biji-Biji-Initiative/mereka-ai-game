'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore, GamePhase } from '@/store';
// Re-import necessary hooks and types
import { useGenerateChallenge } from '@/services/api/services';
import { Challenge } from '@/services/api/services/challengeService';
import { ApiResponse } from '@/services/api/apiResponse';
import { UIChallenge } from '@/types/api';

/**
 * Map of GamePhase values to their corresponding routes
 */
const PHASE_TO_ROUTE: Record<GamePhase, string> = {
  [GamePhase.WELCOME]: '/',
  [GamePhase.CONTEXT]: '/context',
  [GamePhase.TRAITS]: '/traits',
  [GamePhase.ATTITUDES]: '/attitudes',
  [GamePhase.FOCUS]: '/focus',
  [GamePhase.ROUND1]: '/round1',
  [GamePhase.ROUND2]: '/round2',
  [GamePhase.ROUND3]: '/round3',
  [GamePhase.RESULTS]: '/results'
};

/**
 * GamePhaseNavigator component
 * 
 * Monitors gamePhase and handles:
 * 1. Navigation to the correct route based on the phase.
 * 2. Triggering dynamic challenge generation after FOCUS phase.
 */
export default function GamePhaseNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Selectors for state needed
  const gamePhase = useGameStore((state) => state.gamePhase);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const focus = useGameStore((state) => state.focus);
  const currentChallenge = useGameStore((state) => state.currentChallenge);
  const setCurrentChallenge = useGameStore((state) => state.setCurrentChallenge);
  const traits = useGameStore(state => state.personality.traits);
  const attitudes = useGameStore(state => state.personality.attitudes);
  const userInfo = useGameStore(state => state.userInfo);
  
  // Track the last navigation to prevent loops
  const lastNavigation = useRef({ from: '', to: '', timestamp: 0 });
  
  // Hook for generating challenge
  const generateChallengeMutation = useGenerateChallenge();
  const challengeGenTriggered = useRef(false); // Prevent multiple triggers
  
  // Effect 1: Handle Challenge Generation AFTER Focus Selection
  useEffect(() => {
    console.log(`[Nav Effect 1 - Challenge Gen Check] Phase: ${gamePhase}, Focus: ${!!focus}, Challenge: ${!!currentChallenge}, Triggered: ${challengeGenTriggered.current}`);

    if (
      gamePhase === GamePhase.FOCUS &&
      focus &&                                // Focus is selected
      !currentChallenge &&                      // No challenge set yet
      !generateChallengeMutation.isPending && // Not already generating
      !challengeGenTriggered.current          // Haven't triggered in this render cycle
    ) {
      console.log(`[Nav Effect 1] Triggering challenge generation for focus: ${focus.id}`);
      challengeGenTriggered.current = true; // Mark as triggered

      // Helper function to map API Challenge to UIChallenge
      const mapToUIChallenge = (apiChallenge: Challenge): UIChallenge => ({
        ...apiChallenge,
        status: 'pending',
        difficulty: 'intermediate', // Assuming intermediate, adjust if needed
        content: apiChallenge.description || '', 
        round1Prompt: '', 
        round1Placeholder: '',
        round2Prompt: '',
        round2Placeholder: '',
        round3Description: '',
        round3Prompt: '',
        round3Placeholder: '',
        aiResponseForRound1: '',
        aiResponseForRound2: '',
        createdAt: new Date().toISOString(), 
        userEmail: '' // Add default or get from userInfo if available
      });

      generateChallengeMutation.mutate(
        { focusArea: focus.id, difficulty: 'intermediate' }, // Use selected focus id
        {
          onSuccess: (result: ApiResponse<Challenge>) => {
            if (result.success && result.data) {
              console.log('[Nav Effect 1] Challenge generated:', result.data.id);
              // Convert and set the challenge - DO NOT SET PHASE HERE
              const uiChallengeData: UIChallenge = mapToUIChallenge(result.data); // Use mapper
              setCurrentChallenge(uiChallengeData);
            } else {
              console.error('[Nav Effect 1] Failed to generate challenge:', result.error || 'Unknown API error');
              // Handle error appropriately (e.g., show toast, set error state)
            }
            challengeGenTriggered.current = false; // Reset trigger flag after completion/error
          },
          onError: (error: Error) => {
            console.error('[Nav Effect 1] Error during challenge generation:', error);
            challengeGenTriggered.current = false; // Reset trigger flag on error
            // Handle error appropriately
          },
        }
      );
    } else if (gamePhase !== GamePhase.FOCUS) {
       challengeGenTriggered.current = false; // Reset if we move away from FOCUS phase
    }
  // Only trigger this effect based on the core conditions changing
  }, [gamePhase, focus, currentChallenge, generateChallengeMutation, setCurrentChallenge]);

  // Simplified Navigation Effect: Keeps URL in sync with gamePhase
  // Effect 2: Handle Phase Transition and Navigation
  useEffect(() => {
    console.log(`[Nav Effect 2 - Nav Check] Phase: ${gamePhase}, Path: ${pathname}, Challenge: ${!!currentChallenge}`);
    const currentPath = pathname || '';
    let targetPhase = gamePhase;

    // *** Intermediate Step: Check if Focus is done and challenge ready ***
    if (gamePhase === GamePhase.FOCUS && currentChallenge) {
       console.log('[Nav Effect 2] Focus complete, challenge ready. Setting phase to ROUND1.');
       targetPhase = GamePhase.ROUND1;
       // Set the phase, this effect will run again with the new phase
       setGamePhase(GamePhase.ROUND1); 
       return; // Exit early, let re-render handle navigation
    }
    // **********************************************************************

    const targetRoute = PHASE_TO_ROUTE[targetPhase]; // Determine route based on current or target phase

    console.log(`[Nav Effect 2] Target Route: ${targetRoute}, Current Path: ${currentPath}`);
    
    const now = Date.now();
    if (
      lastNavigation.current.from === currentPath && 
      lastNavigation.current.to === targetRoute && 
      now - lastNavigation.current.timestamp < 2000 
    ) {
      console.log(`[Nav Effect 2] Preventing navigation loop from ${currentPath} to ${targetRoute}`);
      return;
    }
    
    // Navigate if the current path doesn't match the target route for the *current* (or intended target) phase
    if (currentPath !== targetRoute) {
      console.log(`[Nav Effect 2] Navigating from ${currentPath} to ${targetRoute} (Phase: ${targetPhase})`);
      lastNavigation.current = { from: currentPath, to: targetRoute, timestamp: now };
      router.push(targetRoute);
    }
  // Depend on currentChallenge here too, so it re-evaluates the intermediate step
  }, [gamePhase, pathname, router, currentChallenge, setGamePhase]); 
  
  return null;
} 