'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, GamePhase, useIsPhaseCompleted } from '@/store/useGameStore';

interface GamePhaseWrapperProps {
  children: ReactNode;
  targetPhase: GamePhase;
}

/**
 * Wrapper component that ensures the game phase is set correctly
 * This component centralizes the game phase logic so it doesn't need to be
 * repeated in every page component
 * 
 * Refactored to follow Next.js 15 best practices and single responsibility principle.
 */
export default function GamePhaseWrapper({ children, targetPhase }: GamePhaseWrapperProps) {
  const { gamePhase, setGamePhase } = useGameStore();
  const router = useRouter();
  
  // Check if prerequisites are completed
  const isContextCompleted = useIsPhaseCompleted(GamePhase.CONTEXT);
  const isTraitsCompleted = useIsPhaseCompleted(GamePhase.TRAITS);
  const isAttitudesCompleted = useIsPhaseCompleted(GamePhase.ATTITUDES);
  const isFocusCompleted = useIsPhaseCompleted(GamePhase.FOCUS);
  const isRound1Completed = useIsPhaseCompleted(GamePhase.ROUND1);
  const isRound2Completed = useIsPhaseCompleted(GamePhase.ROUND2);
  
  /**
   * Effect 1: Handle phase initialization
   * Only set the phase if coming from a direct navigation (refresh, direct URL entry)
   */
  useEffect(() => {
    console.log(`GamePhaseWrapper: current=${gamePhase}, target=${targetPhase}`);
    
    // Set the phase if coming from WELCOME (initial state) or storage rehydration
    if (gamePhase === GamePhase.WELCOME && targetPhase !== GamePhase.WELCOME) {
      console.log(`GamePhaseWrapper: Setting phase to ${targetPhase} from initial state`);
      setGamePhase(targetPhase);
    }
    
    // Handle direct URL navigation to a page that doesn't match current phase
    // This ensures the game phase is synchronized with the URL
    if (gamePhase !== targetPhase && targetPhase !== GamePhase.WELCOME) {
      // Check if we're navigating forward (to a phase that comes after the current one)
      const isForwardNavigation = Object.values(GamePhase).indexOf(targetPhase) > 
                                 Object.values(GamePhase).indexOf(gamePhase);
      
      // Only update phase if navigating forward or if we're on the welcome page
      if (isForwardNavigation || gamePhase === GamePhase.WELCOME) {
        console.log(`GamePhaseWrapper: Synchronizing phase to match URL: ${targetPhase}`);
        setGamePhase(targetPhase);
      }
    }
  }, [gamePhase, setGamePhase, targetPhase]);
  
  /**
   * Effect 2: Handle prerequisite checks and redirects
   * Ensures users can't access phases without completing prerequisites
   */
  useEffect(() => {
    // Skip checks for welcome and context pages
    if (targetPhase === GamePhase.WELCOME || targetPhase === GamePhase.CONTEXT) {
      return;
    }
    
    try {
      // Context is required for all phases after WELCOME
      if (!isContextCompleted) {
        console.log('Prerequisites not met: Context not completed, redirecting...');
        router.push('/context');
        return;
      }
      
      // Traits are required for FOCUS and beyond
      if (targetPhase === GamePhase.FOCUS || 
          targetPhase === GamePhase.ROUND1 || 
          targetPhase === GamePhase.ROUND2 || 
          targetPhase === GamePhase.ROUND3 || 
          targetPhase === GamePhase.RESULTS) {
        
        if (!isTraitsCompleted) {
          console.log('Prerequisites not met: Traits not completed, redirecting...');
          router.push('/traits');
          return;
        }
        
        // Attitudes are required for FOCUS and beyond (except when on the attitudes page)
        if (!isAttitudesCompleted && targetPhase !== GamePhase.ATTITUDES) {
          console.log('Prerequisites not met: Attitudes not completed, redirecting...');
          router.push('/attitudes');
          return;
        }
      }
      
      // Focus is required for ROUND1 and beyond
      if (targetPhase === GamePhase.ROUND1 || 
          targetPhase === GamePhase.ROUND2 || 
          targetPhase === GamePhase.ROUND3 || 
          targetPhase === GamePhase.RESULTS) {
        
        if (!isFocusCompleted) {
          console.log('Prerequisites not met: Focus not completed, redirecting...');
          router.push('/focus');
          return;
        }
      }
      
      // Round1 is required for ROUND2 and beyond
      if (targetPhase === GamePhase.ROUND2 || 
          targetPhase === GamePhase.ROUND3 || 
          targetPhase === GamePhase.RESULTS) {
        
        if (!isRound1Completed) {
          console.log('Prerequisites not met: Round 1 not completed, redirecting...');
          router.push('/round1');
          return;
        }
      }
      
      // Round2 is required for ROUND3 and RESULTS
      if (targetPhase === GamePhase.ROUND3 || targetPhase === GamePhase.RESULTS) {
        if (!isRound2Completed) {
          console.log('Prerequisites not met: Round 2 not completed, redirecting...');
          router.push('/round2');
          return;
        }
      }
    } catch (error) {
      console.error('Error in prerequisite checks:', error);
      // If there's an error in the prerequisite checks, we should still allow navigation
      // to prevent users from getting stuck
    }
  }, [
    targetPhase, 
    router, 
    isContextCompleted, 
    isTraitsCompleted, 
    isAttitudesCompleted, 
    isFocusCompleted, 
    isRound1Completed, 
    isRound2Completed
  ]);
  
  return <>{children}</>;
}
