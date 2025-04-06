'use client';

import React from 'react';
import { Focus } from '@/features/focus/focus';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';

export default function FocusPage() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.FOCUS}>
      <Focus />
    </GamePhaseWrapper>
  );
}
