'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, GamePhase, useIsPhaseCompleted } from '@/store/useGameStore';
import { useErrorHandler } from '@/lib/error/ErrorHandlers';
import { PageErrorBoundary } from '@/components/error/PageErrorBoundary';

interface GamePhaseWrapperProps {
  children: ReactNode;
  targetPhase: GamePhase;
}

/**
 * Wrapper component that ensures the game phase is set correctly
 * This component centralizes the game phase logic so it doesn't need to be
 * repeated in every page component
 * 
 * Enhanced with error handling and graceful degradation for Phase 3
 */
function GamePhaseWrapperContent({ children, targetPhase }: GamePhaseWrapperProps) {
  const { gamePhase, setGamePhase } = useGameStore();
  const router = useRouter();
  const { handleError, handleWarning, handleInfo } = useErrorHandler('GamePhaseWrapper');
  
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
    try {
      handleInfo(`GamePhaseWrapper: current=${gamePhase}, target=${targetPhase}`);
      
      // Set the phase if coming from WELCOME (initial state) or storage rehydration
      if (gamePhase === GamePhase.WELCOME && targetPhase !== GamePhase.WELCOME) {
        handleInfo(`Setting phase to ${targetPhase} from initial state`);
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
          handleInfo(`Synchronizing phase to match URL: ${targetPhase}`);
          setGamePhase(targetPhase);
        }
      }
    } catch (error) {
      handleError(error, { 
        context: 'phase-initialization', 
        currentPhase: gamePhase, 
        targetPhase 
      });
      // Graceful degradation: still render children even if phase sync fails
    }
  }, [gamePhase, setGamePhase, targetPhase, handleError, handleInfo]);
  
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
        handleInfo('Prerequisites not met: Context not completed, redirecting...');
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
          handleInfo('Prerequisites not met: Traits not completed, redirecting...');
          router.push('/traits');
          return;
        }
        
        // Attitudes are required for FOCUS and beyond (except when on the attitudes page)
        if (!isAttitudesCompleted && targetPhase !== GamePhase.ATTITUDES) {
          handleInfo('Prerequisites not met: Attitudes not completed, redirecting...');
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
          handleInfo('Prerequisites not met: Focus not completed, redirecting...');
          router.push('/focus');
          return;
        }
      }
      
      // Round1 is required for ROUND2 and beyond
      if (targetPhase === GamePhase.ROUND2 || 
          targetPhase === GamePhase.ROUND3 || 
          targetPhase === GamePhase.RESULTS) {
        
        if (!isRound1Completed) {
          handleInfo('Prerequisites not met: Round 1 not completed, redirecting...');
          router.push('/round1');
          return;
        }
      }
      
      // Round2 is required for ROUND3 and RESULTS
      if (targetPhase === GamePhase.ROUND3 || targetPhase === GamePhase.RESULTS) {
        if (!isRound2Completed) {
          handleInfo('Prerequisites not met: Round 2 not completed, redirecting...');
          router.push('/round2');
          return;
        }
      }
    } catch (error) {
      handleError(error, { 
        context: 'prerequisite-checks', 
        targetPhase,
        completionStatus: {
          context: isContextCompleted,
          traits: isTraitsCompleted,
          attitudes: isAttitudesCompleted,
          focus: isFocusCompleted,
          round1: isRound1Completed,
          round2: isRound2Completed
        }
      });
      
      // Graceful degradation: If there's an error in prerequisite checks,
      // we should still allow navigation to prevent users from getting stuck
      handleWarning('Error in prerequisite checks, allowing navigation to continue');
    }
  }, [
    targetPhase, 
    router, 
    isContextCompleted, 
    isTraitsCompleted, 
    isAttitudesCompleted, 
    isFocusCompleted, 
    isRound1Completed, 
    isRound2Completed,
    handleError,
    handleWarning,
    handleInfo
  ]);
  
  return <>{children}</>;
}

/**
 * Export the GamePhaseWrapper with error boundary
 * This ensures that errors in the wrapper don't crash the entire application
 */
export default function GamePhaseWrapper(props: GamePhaseWrapperProps) {
  return (
    <PageErrorBoundary>
      <GamePhaseWrapperContent {...props} />
    </PageErrorBoundary>
  );
}
