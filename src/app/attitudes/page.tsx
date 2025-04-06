'use client';

import React from 'react';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import AIAttitudeAssessment from '@/features/assessment/AIAttitudeAssessment';

export default function AttitudesPage() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.ATTITUDES}>
      <AIAttitudeAssessment />
    </GamePhaseWrapper>
  );
} 