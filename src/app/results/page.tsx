'use client';

import React from 'react';
import Results from '@/features/results/results';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store';

export default function ResultsPage() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.RESULTS}>
      <Results />
    </GamePhaseWrapper>
  );
}
