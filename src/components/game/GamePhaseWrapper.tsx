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
  
  // ONLY set the phase if coming from a direct navigation (refresh, direct URL entry)
  // otherwise, don't overwrite the phase to prevent infinite loops
  useEffect(() => {
    console.log(`GamePhaseWrapper: current=${gamePhase}, target=${targetPhase}`);
    
    // Only set the phase if coming from WELCOME (initial state) or storage rehydration
    if (gamePhase === GamePhase.WELCOME && targetPhase !== GamePhase.WELCOME) {
      console.log(`GamePhaseWrapper: Setting phase to ${targetPhase} from initial state`);
      setGamePhase(targetPhase);
    }
    
    // Check prerequisites and redirect if necessary
    if (targetPhase !== GamePhase.WELCOME && targetPhase !== GamePhase.CONTEXT) {
      if (!isContextCompleted) {
        console.log('Prerequisites not met: Context not completed, redirecting...');
        router.push('/context');
        return;
      }
    }
    
    if (targetPhase === GamePhase.FOCUS || targetPhase === GamePhase.ROUND1 || 
        targetPhase === GamePhase.ROUND2 || targetPhase === GamePhase.ROUND3 || 
        targetPhase === GamePhase.RESULTS) {
      if (!isTraitsCompleted) {
        console.log('Prerequisites not met: Traits not completed, redirecting...');
        router.push('/traits');
        return;
      }
      
      if (!isAttitudesCompleted && targetPhase !== GamePhase.ATTITUDES) {
        console.log('Prerequisites not met: Attitudes not completed, redirecting...');
        router.push('/attitudes');
        return;
      }
    }
    
    if (targetPhase === GamePhase.ROUND1 || targetPhase === GamePhase.ROUND2 || 
        targetPhase === GamePhase.ROUND3 || targetPhase === GamePhase.RESULTS) {
      if (!isFocusCompleted) {
        console.log('Prerequisites not met: Focus not completed, redirecting...');
        router.push('/focus');
        return;
      }
    }
    
    if (targetPhase === GamePhase.ROUND2 || targetPhase === GamePhase.ROUND3 || 
        targetPhase === GamePhase.RESULTS) {
      if (!isRound1Completed) {
        console.log('Prerequisites not met: Round 1 not completed, redirecting...');
        router.push('/round1');
        return;
      }
    }
    
    if (targetPhase === GamePhase.ROUND3 || targetPhase === GamePhase.RESULTS) {
      if (!isRound2Completed) {
        console.log('Prerequisites not met: Round 2 not completed, redirecting...');
        router.push('/round2');
        return;
      }
    }
  }, [
    gamePhase, 
    setGamePhase, 
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
