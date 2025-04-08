'use client';

import React from 'react';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function Round2Page() {
  return (
    <ErrorBoundary
      resetOnChange={[GamePhase.ROUND2]}
      onError={(error) => {
        console.error('Round2 error caught by boundary:', error);
      }}
    >
      <GamePhaseWrapper targetPhase={GamePhase.ROUND2}>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Round 2 Challenge</h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <p className="text-lg mb-4">
              This round is currently under development. Please check back later for the complete challenge.
            </p>
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => window.location.href = '/round3'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Continue to Round 3
              </button>
            </div>
          </div>
        </div>
      </GamePhaseWrapper>
    </ErrorBoundary>
  );
}
