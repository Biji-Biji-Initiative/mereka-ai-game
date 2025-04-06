'use client';

import React from 'react';
import Round1 from '@/features/rounds/Round1';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';

export default function Round1Page() {
  // Use GamePhaseWrapper to handle proper game flow
  return (
    <GamePhaseWrapper targetPhase={GamePhase.ROUND1}>
      <Round1 />
    </GamePhaseWrapper>
  );
}
