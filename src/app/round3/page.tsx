'use client';

import React from 'react';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function Round3Page() {
  return (
    <ErrorBoundary
      resetOnChange={[GamePhase.ROUND3]}
      onError={(error) => {
        console.error('Round3 error caught by boundary:', error);
      }}
    >
      <GamePhaseWrapper targetPhase={GamePhase.ROUND3}>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Round 3 Challenge</h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <p className="text-lg mb-4">
              This round is currently under development. Please check back later for the complete challenge.
            </p>
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => window.location.href = '/results'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      </GamePhaseWrapper>
    </ErrorBoundary>
  );
}
