'use client';

import React from 'react';
import Round2 from '@/features/rounds/Round2';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';

export default function Round2Page() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.ROUND2}>
      <Round2 />
    </GamePhaseWrapper>
  );
}
