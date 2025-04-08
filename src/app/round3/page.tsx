'use client';

import React from 'react';
import { Round3 } from '@/features/rounds/Round3';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function Round3Page() {
  // Use GamePhaseWrapper to handle proper game flow
  // Wrap with ErrorBoundary to catch and handle any errors
  return (
    <ErrorBoundary
      resetOnChange={[GamePhase.ROUND3]}
      onError={(error) => {
        console.error('Round3 error caught by boundary:', error);
      }}
    >
      <GamePhaseWrapper targetPhase={GamePhase.ROUND3}>
        <Round3 />
      </GamePhaseWrapper>
    </ErrorBoundary>
  );
}
