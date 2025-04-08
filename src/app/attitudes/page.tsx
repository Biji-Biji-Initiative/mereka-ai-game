'use client';

import React from 'react';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import { StepByStepAttitudeAssessment } from '@/features/assessment/components/StepByStepAttitudeAssessment';

export default function AttitudesPage() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.ATTITUDES}>
      <StepByStepAttitudeAssessment />
    </GamePhaseWrapper>
  );
}
