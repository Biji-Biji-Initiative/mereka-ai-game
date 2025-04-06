import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Rival, RivalGenerationParams } from '@/types/rival';
import { generateRival, updateRivalPerformance, calculateOverallComparison } from '@/services/rivalService';
import { Trait, AiAttitude } from '@/store/useGameStore';

interface RivalState {
  // Current rival for the game session
  currentRival: Rival | null;
  
  // History of past rivals
  rivalHistory: Rival[];
  
  // Rivalry intensity preference
  preferredRivalryStyle: 'friendly' | 'competitive' | 'intense';
  
  // Difficulty level preference
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  
  // Actions
  generateNewRival: (params: RivalGenerationParams) => void;
  updateRivalPerformance: (round: 'round1' | 'round2' | 'round3', score: number) => void;
  calculateFinalComparison: (userRoundResults: { round1?: number; round2?: number; round3?: number }) => void;
  setPreferredRivalryStyle: (style: 'friendly' | 'competitive' | 'intense') => void;
  setPreferredDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  resetRival: () => void;
}

// Initial state
const initialState = {
  currentRival: null,
  rivalHistory: [],
  preferredRivalryStyle: 'competitive' as const,
  preferredDifficulty: 'medium' as const,
};

// Create the rival store
export const useRivalStore = create<RivalState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      generateNewRival: (params: RivalGenerationParams) => {
        // Use the rivalry style and difficulty preferences if not specified
        const rivalParams = {
          ...params,
          rivalryStyle: params.rivalryStyle || get().preferredRivalryStyle,
          difficultyLevel: params.difficultyLevel || get().preferredDifficulty
        };
        
        // Generate a new rival
        const newRival = generateRival(rivalParams);
        
        set({ currentRival: newRival });
      },
      
      updateRivalPerformance: (round: 'round1' | 'round2' | 'round3', score: number) => {
        const { currentRival } = get();
        if (!currentRival) return;
        
        const updatedRival = updateRivalPerformance(currentRival, round, score);
        set({ currentRival: updatedRival });
      },
      
      calculateFinalComparison: (userRoundResults: { round1?: number; round2?: number; round3?: number }) => {
        const { currentRival } = get();
        if (!currentRival) return;
        
        const rivalWithComparison = calculateOverallComparison(currentRival, userRoundResults);
        
        // Add to history and update current rival
        set(state => ({
          currentRival: rivalWithComparison,
          rivalHistory: [...state.rivalHistory, rivalWithComparison]
        }));
      },
      
      setPreferredRivalryStyle: (style: 'friendly' | 'competitive' | 'intense') => {
        set({ preferredRivalryStyle: style });
      },
      
      setPreferredDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => {
        set({ preferredDifficulty: difficulty });
      },
      
      resetRival: () => {
        set({ currentRival: null });
      }
    }),
    {
      name: 'ai-fight-club-rival-storage',
      partialize: (state) => ({
        rivalHistory: state.rivalHistory,
        preferredRivalryStyle: state.preferredRivalryStyle,
        preferredDifficulty: state.preferredDifficulty
      })
    }
  )
);
