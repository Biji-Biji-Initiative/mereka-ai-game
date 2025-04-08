'use client';

import React from 'react';
import Round1 from '@/features/rounds/Round1';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function Round1Page() {
  // Use GamePhaseWrapper to handle proper game flow
  // Wrap with ErrorBoundary to catch and handle any errors
  return (
    <ErrorBoundary
      resetOnChange={[GamePhase.ROUND1]}
      onError={(error) => {
        console.error('Round1 error caught by boundary:', error);
      }}
    >
      <GamePhaseWrapper targetPhase={GamePhase.ROUND1}>
        <Round1 />
      </GamePhaseWrapper>
    </ErrorBoundary>
  );
}
