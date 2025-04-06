'use client';

import { ReactNode, useEffect } from 'react';
import { useGameStore, GamePhase } from '@/store/useGameStore';

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
  
  // ONLY set the phase if coming from a direct navigation (refresh, direct URL entry)
  // otherwise, don't overwrite the phase to prevent infinite loops
  useEffect(() => {
    console.log(`GamePhaseWrapper: current=${gamePhase}, target=${targetPhase}`);
    
    // Only set the phase if coming from WELCOME (initial state) or storage rehydration
    if (gamePhase === GamePhase.WELCOME && targetPhase !== GamePhase.WELCOME) {
      console.log(`GamePhaseWrapper: Setting phase to ${targetPhase} from initial state`);
      setGamePhase(targetPhase);
    }
  }, [gamePhase, setGamePhase, targetPhase]);
  
  return <>{children}</>;
} 