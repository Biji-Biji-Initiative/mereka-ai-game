'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/providers/ToastProvider';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import { useLog } from '@/providers/LogProvider';

/**
 * Component to test the game flow functionality
 */
export function GameFlowTest() {
  const { addLog } = useLog();
  const { showToast } = useToast();
  const {
    gamePhase,
    personality,
    focus,
    responses,
    setGamePhase,
    getIsPhaseCompleted,
    saveTraits,
    saveFocus,
    saveRound1Response,
    saveRound2Response,
    saveRound3Response,
    resetGame
  } = useGameStore();

  // Mock data for testing
  const mockTraits = [
    {
      id: 'analytical',
      name: 'Analytical Thinking',
      score: 7,
      description: 'Your ability to break down complex problems and analyze information logically.',
      value: 7
    },
    {
      id: 'creative',
      name: 'Creative Problem Solving',
      score: 8,
      description: 'Your ability to think outside the box and generate innovative solutions.',
      value: 8
    },
    {
      id: 'adaptability',
      name: 'Adaptability',
      score: 6,
      description: 'Your ability to adjust to new conditions and handle unexpected changes.',
      value: 6
    }
  ];

  const mockFocus = {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Challenge the AI with complex problems that require analytical thinking and creative solutions.',
    matchLevel: 85
  };

  const mockResponse = "This is a sample response for testing purposes. It simulates what a user might write during one of the rounds.";

  // Test functions
  const handleSetTraits = () => {
    saveTraits(mockTraits);
    addLog('info', 'Set mock traits', mockTraits);
    showToast('Traits Set', 'Mock traits have been set in the game store', 'success');
  };

  const handleSetFocus = () => {
    saveFocus(mockFocus);
    addLog('info', 'Set mock focus', mockFocus);
    showToast('Focus Set', 'Mock focus has been set in the game store', 'success');
  };

  const handleSetRoundResponse = (round: number) => {
    if (round === 1) {
      saveRound1Response(mockResponse);
    } else if (round === 2) {
      saveRound2Response(mockResponse);
    } else if (round === 3) {
      saveRound3Response(mockResponse);
    }
    
    addLog('info', `Set mock response for round ${round}`, mockResponse);
    showToast('Round Response Set', `Mock response for round ${round} has been set`, 'success');
  };

  const handleSetGamePhase = (phase: GamePhase) => {
    setGamePhase(phase);
    addLog('info', `Game phase changed to: ${phase}`);
    showToast('Phase Changed', `Game phase is now "${phase}"`, 'info');
  };

  const handleResetGame = () => {
    resetGame();
    addLog('info', 'Game state reset');
    showToast('Game Reset', 'Game state has been reset to initial values', 'warning');
  };

  // Get a list of completed phases for display
  const getCompletedPhases = () => {
    return Object.values(GamePhase)
      .filter(phase => getIsPhaseCompleted(phase))
      .join(', ');
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm mt-8">
      <h2 className="text-2xl font-bold mb-4">Game Flow Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current State Display */}
        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Current Game State</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Current Phase:</span> {gamePhase}</div>
            <div><span className="font-medium">Completed Phases:</span> {getCompletedPhases() || 'None'}</div>
            <div><span className="font-medium">Traits:</span> {personality.traits?.length > 0 ? `${personality.traits.length} traits set` : 'None'}</div>
            <div><span className="font-medium">Selected Focus:</span> {focus?.name || 'None'}</div>
            <div>
              <span className="font-medium">Round Responses:</span>
              <ul className="ml-4 list-disc">
                <li>Round 1: {responses.round1?.userResponse ? 'Completed' : 'Not completed'}</li>
                <li>Round 2: {responses.round2?.userResponse ? 'Completed' : 'Not completed'}</li>
                <li>Round 3: {responses.round3?.userResponse ? 'Completed' : 'Not completed'}</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Test Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">Test Actions</h3>
          
          <div className="space-y-2">
            <h4 className="font-medium">Game Data</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSetTraits}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md"
              >
                Set Traits
              </button>
              <button
                onClick={handleSetFocus}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md"
              >
                Set Focus
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Round Responses</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSetRoundResponse(1)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-md"
              >
                Set Round 1
              </button>
              <button
                onClick={() => handleSetRoundResponse(2)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-md"
              >
                Set Round 2
              </button>
              <button
                onClick={() => handleSetRoundResponse(3)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-md"
              >
                Set Round 3
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Game Flow</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSetGamePhase(GamePhase.WELCOME)}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded-md"
              >
                Complete Welcome
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.TRAITS)}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded-md"
              >
                Complete Assessment
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.FOCUS)}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded-md"
              >
                Complete Focus
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.ROUND1)}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded-md"
              >
                Complete Round 1
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Navigation</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSetGamePhase(GamePhase.WELCOME)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Welcome
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.CONTEXT)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Context
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.TRAITS)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Traits
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.FOCUS)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Focus
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.ROUND1)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Round 1
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.ROUND2)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Round 2
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.ROUND3)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Round 3
              </button>
              <button
                onClick={() => handleSetGamePhase(GamePhase.RESULTS)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md"
              >
                Go to Results
              </button>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleResetGame}
              className="px-4 py-2 bg-red-500 text-white rounded-md w-full"
            >
              Reset Game State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
