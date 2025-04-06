'use client';

import TraitAssessment from '@/features/assessment/TraitAssessment';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';

export default function TraitsPage() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.TRAITS}>
      <TraitAssessment />
    </GamePhaseWrapper>
  );
}
