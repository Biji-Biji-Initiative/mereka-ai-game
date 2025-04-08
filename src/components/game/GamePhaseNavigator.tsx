'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore, GamePhase } from '@/store';
import { useGenerateChallenge } from '@/services/api/services';
import { Challenge } from '@/services/api/services/challengeService';
import { ApiResponse } from '@/services/api/apiResponse';
import { UIChallenge } from '@/types/api';
import { useErrorHandler } from '@/lib/error/ErrorHandlers';
import { useErrorContext } from '@/lib/error/ErrorProvider';
import { PageErrorBoundary } from '@/components/error/PageErrorBoundary';

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
 * GamePhaseNavigator component content
 * 
 * Monitors gamePhase and handles:
 * 1. Navigation to the correct route based on the phase.
 * 2. Triggering dynamic challenge generation after FOCUS phase.
 * 
 * Enhanced with error handling and graceful degradation for Phase 3
 */
function GamePhaseNavigatorContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { addError } = useErrorContext();
  const { handleError, handleWarning, handleInfo } = useErrorHandler('GamePhaseNavigator');
  
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
  const challengeGenRetries = useRef(0); // Track retries for graceful degradation
  const MAX_RETRIES = 3; // Maximum number of retries for challenge generation
  
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
    
    try {
      handleInfo(`Triggering challenge generation for focus: ${focus.id}`);
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
              handleInfo(`Challenge generated: ${result.data.id}`);
              const uiChallengeData: UIChallenge = mapToUIChallenge(result.data);
              setCurrentChallenge(uiChallengeData);
              // Reset retry counter on success
              challengeGenRetries.current = 0;
            } else {
              handleWarning(`Failed to generate challenge: ${result.error || 'Unknown API error'}`);
              
              // Graceful degradation: Retry challenge generation with backoff
              if (challengeGenRetries.current < MAX_RETRIES) {
                challengeGenRetries.current++;
                const backoffTime = Math.pow(2, challengeGenRetries.current) * 1000;
                handleInfo(`Retrying challenge generation in ${backoffTime/1000} seconds (attempt ${challengeGenRetries.current}/${MAX_RETRIES})`);
                
                setTimeout(() => {
                  challengeGenTriggered.current = false; // Reset trigger to allow retry
                }, backoffTime);
              } else {
                // After max retries, create a fallback challenge
                handleWarning(`Max retries reached. Creating fallback challenge.`);
                const fallbackChallenge: UIChallenge = {
                  id: `fallback-${Date.now()}`,
                  title: "Fallback Challenge",
                  description: "We couldn't generate a personalized challenge. Here's a general challenge instead.",
                  status: 'pending',
                  difficulty: 'intermediate',
                  content: "This is a fallback challenge. Please continue with the game.", 
                  round1Prompt: "What strategies would you use to solve this problem?", 
                  round1Placeholder: "Enter your response here...",
                  round2Prompt: "How would you improve your solution?",
                  round2Placeholder: "Enter your improved solution here...",
                  round3Description: "Final round",
                  round3Prompt: "What did you learn from this challenge?",
                  round3Placeholder: "Enter your reflections here...",
                  aiResponseForRound1: "",
                  aiResponseForRound2: "",
                  createdAt: new Date().toISOString(), 
                  userEmail: "",
                  focusArea: focus.id
                };
                setCurrentChallenge(fallbackChallenge);
                
                // Notify user about the fallback
                addError(
                  "Challenge Generation Issue", 
                  "We couldn't create a personalized challenge. A general challenge has been provided instead."
                );
              }
            }
            challengeGenTriggered.current = false;
          },
          onError: (error: Error) => {
            handleError(error, { context: 'challenge-generation', focusId: focus.id });
            
            // Graceful degradation: Similar retry logic as above
            if (challengeGenRetries.current < MAX_RETRIES) {
              challengeGenRetries.current++;
              const backoffTime = Math.pow(2, challengeGenRetries.current) * 1000;
              handleInfo(`Retrying challenge generation in ${backoffTime/1000} seconds (attempt ${challengeGenRetries.current}/${MAX_RETRIES})`);
              
              setTimeout(() => {
                challengeGenTriggered.current = false; // Reset trigger to allow retry
              }, backoffTime);
            } else {
              // Create fallback challenge after max retries
              handleWarning(`Max retries reached. Creating fallback challenge.`);
              const fallbackChallenge: UIChallenge = {
                id: `fallback-${Date.now()}`,
                title: "Fallback Challenge",
                description: "We couldn't generate a personalized challenge. Here's a general challenge instead.",
                status: 'pending',
                difficulty: 'intermediate',
                content: "This is a fallback challenge. Please continue with the game.", 
                round1Prompt: "What strategies would you use to solve this problem?", 
                round1Placeholder: "Enter your response here...",
                round2Prompt: "How would you improve your solution?",
                round2Placeholder: "Enter your improved solution here...",
                round3Description: "Final round",
                round3Prompt: "What did you learn from this challenge?",
                round3Placeholder: "Enter your reflections here...",
                aiResponseForRound1: "",
                aiResponseForRound2: "",
                createdAt: new Date().toISOString(), 
                userEmail: "",
                focusArea: focus.id
              };
              setCurrentChallenge(fallbackChallenge);
              
              // Notify user about the fallback
              addError(
                "Challenge Generation Issue", 
                "We couldn't create a personalized challenge. A general challenge has been provided instead."
              );
            }
            challengeGenTriggered.current = false;
          },
        }
      );
    } catch (error) {
      handleError(error, { context: 'challenge-generation-setup' });
      challengeGenTriggered.current = false;
      
      // Graceful degradation: Allow navigation to continue even if challenge generation fails
      // This prevents users from getting stuck on the focus page
      if (challengeGenRetries.current >= MAX_RETRIES) {
        handleWarning('Challenge generation failed completely. Creating emergency fallback.');
        const emergencyFallback: UIChallenge = {
          id: `emergency-${Date.now()}`,
          title: "Emergency Fallback Challenge",
          description: "We encountered an issue. Here's a basic challenge to continue the game.",
          status: 'pending',
          difficulty: 'intermediate',
          content: "This is an emergency fallback challenge.", 
          round1Prompt: "Please share your thoughts on this topic.", 
          round1Placeholder: "Enter your thoughts here...",
          round2Prompt: "Please elaborate further.",
          round2Placeholder: "Enter more details here...",
          round3Description: "Final thoughts",
          round3Prompt: "What are your final thoughts?",
          round3Placeholder: "Enter your final thoughts here...",
          aiResponseForRound1: "",
          aiResponseForRound2: "",
          createdAt: new Date().toISOString(), 
          userEmail: "",
          focusArea: focus?.id || "general"
        };
        setCurrentChallenge(emergencyFallback);
        
        // Notify user about the emergency fallback
        addError(
          "Critical Challenge Generation Error", 
          "We encountered a problem creating your challenge. A basic challenge has been provided to allow you to continue."
        );
      }
    }
  }, [gamePhase, focus, currentChallenge, generateChallengeMutation, setCurrentChallenge, handleError, handleWarning, handleInfo, addError]);

  /**
   * Effect 2: Handle Phase Transitions
   * Single responsibility: Update game phase based on completion status
   */
  useEffect(() => {
    try {
      // Handle FOCUS to ROUND1 transition when challenge is ready
      if (gamePhase === GamePhase.FOCUS && currentChallenge) {
        handleInfo('Focus complete, challenge ready. Setting phase to ROUND1.');
        setGamePhase(GamePhase.ROUND1);
      }
      
      // Handle phase completion checks and transitions
      // Check if current phase is completed but we haven't moved to the next phase
      const isCurrentPhaseCompleted = getIsPhaseCompleted(gamePhase);
      
      if (isCurrentPhaseCompleted) {
        // Determine the next phase based on the current phase
        let nextPhase: GamePhase | null = null;
        
        switch (gamePhase) {
          case GamePhase.CONTEXT:
            nextPhase = GamePhase.TRAITS;
            break;
          case GamePhase.TRAITS:
            nextPhase = GamePhase.ATTITUDES;
            break;
          case GamePhase.ATTITUDES:
            nextPhase = GamePhase.FOCUS;
            break;
          case GamePhase.ROUND1:
            nextPhase = GamePhase.ROUND2;
            break;
          case GamePhase.ROUND2:
            nextPhase = GamePhase.ROUND3;
            break;
          case GamePhase.ROUND3:
            nextPhase = GamePhase.RESULTS;
            break;
          default:
            // No transition needed for other phases
            break;
        }
        
        // If we determined a next phase, set it
        if (nextPhase && gamePhase !== nextPhase) {
          handleInfo(`Phase ${gamePhase} completed. Transitioning to ${nextPhase}.`);
          setGamePhase(nextPhase);
        }
      }
    } catch (error) {
      handleError(error, { 
        context: 'phase-transition', 
        currentPhase: gamePhase,
        hasChallenge: !!currentChallenge
      });
      
      // Graceful degradation: If there's an error in phase transition,
      // we should still allow the user to continue by manually navigating
      addError(
        "Navigation Issue", 
        "We encountered a problem with automatic navigation. You can continue by using the navigation menu."
      );
    }
  }, [gamePhase, currentChallenge, setGamePhase, getIsPhaseCompleted, handleError, handleInfo, addError]);

  /**
   * Effect 3: Handle Navigation
   * Single responsibility: Keep URL in sync with game phase
   */
  useEffect(() => {
    try {
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
        handleInfo(`Navigating from ${currentPath} to ${targetRoute} (Phase: ${gamePhase})`);
        lastNavigation.current = { from: currentPath, to: targetRoute, timestamp: now };
        
        // Check if phase is completed before navigation
        const isCurrentPhaseCompleted = getIsPhaseCompleted(gamePhase);
        
        // Only navigate if the current phase is completed or we're on the welcome page
        if (isCurrentPhaseCompleted || gamePhase === GamePhase.WELCOME || currentPath === '/') {
          router.push(targetRoute);
        } else {
          handleWarning(`Not navigating to ${targetRoute} because current phase ${gamePhase} is not completed`);
        }
      }
    } catch (error) {
      handleError(error, { 
        context: 'navigation', 
        currentPath: pathname,
        targetPhase: gamePhase
      });
      
      // Graceful degradation: still try to navigate even if there was an error checking completion
      try {
        const targetRoute = PHASE_TO_ROUTE[gamePhase];
        handleWarning(`Navigation error recovery: Attempting to navigate to ${targetRoute}`);
        router.push(targetRoute);
      } catch (navError) {
        handleError(navError, { context: 'navigation-recovery' });
        
        // Last resort: If we can't navigate programmatically, inform the user
        addError(
          "Navigation Error", 
          "We're having trouble navigating automatically. Please use the menu to continue."
        );
      }
    }
  }, [gamePhase, pathname, router, getIsPhaseCompleted, handleError, handleWarning, handleInfo, addError]); 
  
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

/**
 * Export the GamePhaseNavigator with error boundary
 * This ensures that errors in the navigator don't crash the entire application
 */
export default function GamePhaseNavigator() {
  return (
    <PageErrorBoundary>
      <GamePhaseNavigatorContent />
    </PageErrorBoundary>
  );
}
