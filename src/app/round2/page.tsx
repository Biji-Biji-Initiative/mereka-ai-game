'use client';

import React from 'react';
import Round2 from '@/features/rounds/Round2';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function Round2Page() {
  // Use GamePhaseWrapper to handle proper game flow
  // Wrap with ErrorBoundary to catch and handle any errors
  return (
    <ErrorBoundary
      resetOnChange={[GamePhase.ROUND2]}
      onError={(error) => {
        console.error('Round2 error caught by boundary:', error);
      }}
    >
      <GamePhaseWrapper targetPhase={GamePhase.ROUND2}>
        <Round2 />
      </GamePhaseWrapper>
    </ErrorBoundary>
  );
}
