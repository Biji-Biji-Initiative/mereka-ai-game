'use client';

import React from 'react';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import ResultsPage from '@/features/results/ResultsPage';

export default function ResultsPageContainer() {
  return (
    <ErrorBoundary
      resetOnChange={[GamePhase.RESULTS]}
      onError={(error) => {
        console.error('Results error caught by boundary:', error);
      }}
    >
      <GamePhaseWrapper targetPhase={GamePhase.RESULTS}>
        <ResultsPage />
      </GamePhaseWrapper>
    </ErrorBoundary>
  );
}
