'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore, GamePhase } from '@/store';
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
 * 
 * Refactored to follow Next.js 15 best practices and single responsibility principle.
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
  const getIsPhaseCompleted = useGameStore((state) => state.getIsPhaseCompleted);
  
  // Track the last navigation to prevent loops
  const lastNavigation = useRef({ from: '', to: '', timestamp: 0 });
  
  // Hook for generating challenge
  const generateChallengeMutation = useGenerateChallenge();
  const challengeGenTriggered = useRef(false); // Prevent multiple triggers
  
  /**
   * Effect 1: Handle Challenge Generation AFTER Focus Selection
   * Single responsibility: Generate challenge when focus is selected
   */
  useEffect(() => {
    // Skip if not in FOCUS phase or no focus selected
    if (gamePhase !== GamePhase.FOCUS || !focus) return;
    
    // Skip if challenge already exists
    if (currentChallenge) return;
    
    // Skip if already generating
    if (generateChallengeMutation.isPending) return;
    
    // Skip if already triggered in this render cycle
    if (challengeGenTriggered.current) return;
    
    console.log(`[Nav Effect 1] Triggering challenge generation for focus: ${focus.id}`);
    challengeGenTriggered.current = true; // Mark as triggered

    // Helper function to map API Challenge to UIChallenge
    const mapToUIChallenge = (apiChallenge: Challenge): UIChallenge => ({
      ...apiChallenge,
      status: 'pending',
      difficulty: 'intermediate',
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
      userEmail: ''
    });

    generateChallengeMutation.mutate(
      { focusArea: focus.id, difficulty: 'intermediate' },
      {
        onSuccess: (result: ApiResponse<Challenge>) => {
          if (result.success && result.data) {
            console.log('[Nav Effect 1] Challenge generated:', result.data.id);
            const uiChallengeData: UIChallenge = mapToUIChallenge(result.data);
            setCurrentChallenge(uiChallengeData);
          } else {
            console.error('[Nav Effect 1] Failed to generate challenge:', result.error || 'Unknown API error');
          }
          challengeGenTriggered.current = false;
        },
        onError: (error: Error) => {
          console.error('[Nav Effect 1] Error during challenge generation:', error);
          challengeGenTriggered.current = false;
        },
      }
    );
  }, [gamePhase, focus, currentChallenge, generateChallengeMutation, setCurrentChallenge]);

  /**
   * Effect 2: Handle Phase Transitions
   * Single responsibility: Update game phase based on completion status
   */
  useEffect(() => {
    // Handle FOCUS to ROUND1 transition when challenge is ready
    if (gamePhase === GamePhase.FOCUS && currentChallenge) {
      console.log('[Nav Effect 2] Focus complete, challenge ready. Setting phase to ROUND1.');
      setGamePhase(GamePhase.ROUND1);
    }
  }, [gamePhase, currentChallenge, setGamePhase]);

  /**
   * Effect 3: Handle Navigation
   * Single responsibility: Keep URL in sync with game phase
   */
  useEffect(() => {
    const currentPath = pathname || '';
    const targetRoute = PHASE_TO_ROUTE[gamePhase];

    // Prevent navigation loops
    const now = Date.now();
    if (
      lastNavigation.current.from === currentPath && 
      lastNavigation.current.to === targetRoute && 
      now - lastNavigation.current.timestamp < 2000 
    ) {
      return;
    }
    
    // Only navigate if current path doesn't match target route
    if (currentPath !== targetRoute) {
      console.log(`[Nav Effect 3] Navigating from ${currentPath} to ${targetRoute} (Phase: ${gamePhase})`);
      lastNavigation.current = { from: currentPath, to: targetRoute, timestamp: now };
      router.push(targetRoute);
    }
  }, [gamePhase, pathname, router]); 
  
  /**
   * Effect 4: Reset challenge generation trigger when leaving FOCUS phase
   */
  useEffect(() => {
    if (gamePhase !== GamePhase.FOCUS) {
      challengeGenTriggered.current = false;
    }
  }, [gamePhase]);
  
  return null;
} 