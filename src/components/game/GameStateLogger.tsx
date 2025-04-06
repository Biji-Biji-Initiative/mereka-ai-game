'use client';

import React, { useEffect } from 'react';
import { useLog } from '@/lib/logging/log-provider';
import { useGameLogger } from '@/hooks/useGameLogger';
import { useGameStore, GamePhase } from '@/store/useGameStore';

/**
 * GameStateLogger component
 * 
 * Automatically logs game state changes by subscribing to the game store
 * Follows React best practices for performance optimization
 */
export function GameStateLogger() {
  const { addLog } = useLog();
  const { logStateChange } = useGameLogger('GameStateLogger');
  
  // Get current game state using primitives instead of objects
  const gamePhase = useGameStore(state => state.gamePhase);
  const traitsCount = useGameStore(state => state.personality?.traits?.length || 0);
  const focusId = useGameStore(state => state.focus?.id);
  const focusName = useGameStore(state => state.focus?.name);
  const round1Completed = useGameStore(state => !!state.responses.round1);
  const round2Completed = useGameStore(state => !!state.responses.round2);
  const round3Completed = useGameStore(state => !!state.responses.round3);
  
  // Subscribe to game store changes
  useEffect(() => {
    // Log initial state
    addLog('info', 'Game state logger initialized', {
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      initialState: {
        gamePhase,
        traitsCount,
        selectedFocus: focusName || 'None',
        rounds: {
          round1: round1Completed ? 'Completed' : 'Not started',
          round2: round2Completed ? 'Completed' : 'Not started',
          round3: round3Completed ? 'Completed' : 'Not started',
        }
      }
    });
    
    // Set up subscription to game store
    let previousPhase = gamePhase;
    const unsubscribe = useGameStore.subscribe((state) => {
      const newPhase = state.gamePhase;
      if (newPhase !== previousPhase) {
        logStateChange('gamePhase', previousPhase, newPhase);
        addLog('info', `Game phase changed: ${previousPhase} → ${newPhase}`, {
          timestamp: new Date(),
          previousPhase,
          currentPhase: newPhase
        });
        previousPhase = newPhase;
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      addLog('info', 'Game state logger destroyed', {
        timestamp: new Date()
      });
    };
  }, [addLog, logStateChange, gamePhase]);
  
  // Monitor traits changes
  useEffect(() => {
    if (traitsCount > 0) {
      addLog('info', 'Personality traits updated', {
        timestamp: new Date(),
        traitsCount
      });
    }
  }, [traitsCount, addLog]);
  
  // Monitor focus selection
  useEffect(() => {
    if (focusId) {
      addLog('info', 'Focus area selected', {
        timestamp: new Date(),
        focusId,
        focusName
      });
    }
  }, [focusId, focusName, addLog]);
  
  // Monitor round results
  useEffect(() => {
    if (round1Completed) {
      addLog('info', 'Round 1 completed', {
        timestamp: new Date()
      });
    }
  }, [round1Completed, addLog]);
  
  useEffect(() => {
    if (round2Completed) {
      addLog('info', 'Round 2 completed', {
        timestamp: new Date()
      });
    }
  }, [round2Completed, addLog]);
  
  useEffect(() => {
    if (round3Completed) {
      addLog('info', 'Round 3 completed', {
        timestamp: new Date()
      });
    }
  }, [round3Completed, addLog]);
  
  // This component doesn't render anything
  return null;
}
