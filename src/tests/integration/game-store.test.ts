import { describe, it, expect, vi } from 'vitest';
import { useGameStore } from '@/store/game-store';
import { act } from '@testing-library/react';

// Create a fresh store for each test
const createFreshStore = () => {
  const store = useGameStore.getState();
  act(() => {
    store.resetGame();
  });
  return useGameStore.getState();
};

describe('Game Store Integration Tests', () => {
  it('initializes with default values', () => {
    const store = createFreshStore();
    
    expect(store.traits).toEqual([]);
    expect(store.selectedFocus).toBeNull();
    expect(store.roundResults).toEqual({
      round1: null,
      round2: null,
      round3: null
    });
  });
  
  it('sets traits correctly', () => {
    const store = createFreshStore();
    const traits = [
      { id: 'autonomy', name: 'Autonomy', score: 4, description: 'Test description' },
      { id: 'creativity', name: 'Creativity', score: 3, description: 'Test description' }
    ];
    
    act(() => {
      store.setTraits(traits);
    });
    
    expect(store.traits).toEqual(traits);
  });
  
  it('sets selected focus correctly', () => {
    const store = createFreshStore();
    const focus = { 
      id: 'creative', 
      name: 'Creative Thinking', 
      description: 'Test description',
      selected: true
    };
    
    act(() => {
      store.setSelectedFocus(focus);
    });
    
    expect(store.selectedFocus).toEqual(focus);
  });
  
  it('sets round results correctly', () => {
    const store = createFreshStore();
    const roundResult = {
      completed: true,
      score: 85,
      timeRemaining: 30,
      timeExpired: false
    };
    
    act(() => {
      store.setRoundResult(1, roundResult);
    });
    
    expect(store.roundResults.round1).toEqual(roundResult);
  });
  
  it('resets game state correctly', () => {
    const store = createFreshStore();
    
    // Set some state
    act(() => {
      store.setTraits([{ id: 'test', name: 'Test', score: 3, description: 'Test' }]);
      store.setSelectedFocus({ id: 'test', name: 'Test', description: 'Test', selected: true });
      store.setRoundResult(1, { completed: true, score: 80, timeRemaining: 20, timeExpired: false });
    });
    
    // Verify state was set
    expect(store.traits.length).toBe(1);
    expect(store.selectedFocus).not.toBeNull();
    expect(store.roundResults.round1).not.toBeNull();
    
    // Reset state
    act(() => {
      store.resetGame();
    });
    
    // Verify state was reset
    expect(store.traits).toEqual([]);
    expect(store.selectedFocus).toBeNull();
    expect(store.roundResults).toEqual({
      round1: null,
      round2: null,
      round3: null
    });
  });
  
  it('maintains game flow state correctly', () => {
    const store = createFreshStore();
    
    // Complete assessment
    act(() => {
      store.setTraits([
        { id: 'autonomy', name: 'Autonomy', score: 4, description: 'Test description' },
        { id: 'creativity', name: 'Creativity', score: 3, description: 'Test description' }
      ]);
    });
    
    // Select focus
    act(() => {
      store.setSelectedFocus({ 
        id: 'creative', 
        name: 'Creative Thinking', 
        description: 'Test description',
        selected: true
      });
    });
    
    // Complete rounds
    act(() => {
      store.setRoundResult(1, { completed: true, score: 85, timeRemaining: 30, timeExpired: false });
      store.setRoundResult(2, { completed: true, score: 75, timeRemaining: 25, timeExpired: false });
      store.setRoundResult(3, { completed: true, score: 90, timeRemaining: 20, timeExpired: false });
    });
    
    // Verify complete game state
    expect(store.traits.length).toBe(2);
    expect(store.selectedFocus?.id).toBe('creative');
    expect(store.roundResults.round1?.score).toBe(85);
    expect(store.roundResults.round2?.score).toBe(75);
    expect(store.roundResults.round3?.score).toBe(90);
  });
});
