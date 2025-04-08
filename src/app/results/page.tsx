'use client';

import React from 'react';
import GamePhaseWrapper from '@/components/game/GamePhaseWrapper';
import { GamePhase } from '@/store/useGameStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function ResultsPage() {
  return (
    <ErrorBoundary
      resetOnChange={[GamePhase.RESULTS]}
      onError={(error) => {
        console.error('Results error caught by boundary:', error);
      }}
    >
      <GamePhaseWrapper targetPhase={GamePhase.RESULTS}>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Your AI Interaction Results</h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Game Complete!</h2>
            <p className="text-lg mb-4">
              Congratulations on completing all rounds of the Mereka AI Game. Your results and personalized AI interaction profile are being generated.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-xl font-medium mb-2 text-green-400">Strengths</h3>
                <p>Your unique human strengths in AI collaboration will appear here.</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-xl font-medium mb-2 text-yellow-400">Insights</h3>
                <p>Personalized insights about your interaction style will appear here.</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-xl font-medium mb-2 text-purple-400">Recommendations</h3>
                <p>Tailored recommendations for improving your AI collaboration will appear here.</p>
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Start New Game
              </button>
            </div>
          </div>
        </div>
      </GamePhaseWrapper>
    </ErrorBoundary>
  );
}
