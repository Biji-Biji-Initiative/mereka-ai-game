'use client';

import UserContextForm from '@/features/onboarding/UserContextForm';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';

export default function ContextPage() {
  return (
    <GamePhaseWrapper targetPhase={GamePhase.CONTEXT}>
      <div className="container max-w-5xl mx-auto p-4 my-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Personal Context</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl">
            Before we assess your human edge, we need to understand your professional context.
            This helps us provide more relevant insights tailored to your specific situation.
          </p>
        </div>
        
        <UserContextForm />
      </div>
    </GamePhaseWrapper>
  );
}
