'use client';

import React from 'react';
import { Assessment } from '@/features/assessment/assessment';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';

export default function AssessmentPage() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.TRAITS}>
      <Assessment />
    </GamePhaseWrapper>
  );
}
