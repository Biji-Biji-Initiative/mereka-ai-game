'use client';

import React from 'react';
import Round3 from '@/features/rounds/Round3';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';

export default function Round3Page() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.ROUND3}>
      <Round3 />
    </GamePhaseWrapper>
  );
}
