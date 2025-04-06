import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Leaderboard, 
  LeaderboardEntry, 
  LeaderboardType,
  LeaderboardTimeframe,
  LeaderboardFilter
} from '@/types/leaderboard';
import { 
  generateMockLeaderboard,
  filterLeaderboardEntries,
  getCurrentUserRank
} from '@/services/leaderboardService';

interface LeaderboardState {
  // Current active leaderboards
  leaderboards: Record<string, Leaderboard>;
  
  // Current user's best scores
  userBestScores: Record<string, number>;
  
  // Current filter settings
  currentFilter: LeaderboardFilter;
  
  // Actions
  fetchLeaderboard: (type: LeaderboardType, timeframe?: LeaderboardTimeframe, focusArea?: string) => Leaderboard;
  updateUserScore: (challengeId: string, score: number) => void;
  setLeaderboardFilter: (filter: Partial<LeaderboardFilter>) => void;
  resetLeaderboards: () => void;
}

// Initial state
const initialState = {
  leaderboards: {},
  userBestScores: {},
  currentFilter: {
    type: 'global' as LeaderboardType,
    timeframe: 'all_time' as LeaderboardTimeframe,
    limit: 20
  }
};

// Create the leaderboard store
export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchLeaderboard: (type, timeframe, focusArea) => {
        const filter: LeaderboardFilter = {
          type,
          timeframe: timeframe || get().currentFilter.timeframe,
          focusArea,
          limit: get().currentFilter.limit
        };
        
        // Generate a unique key for this leaderboard
        const key = `${type}_${filter.timeframe}_${focusArea || 'all'}`;
        
        // Check if we already have this leaderboard cached
        if (get().leaderboards[key]) {
          return get().leaderboards[key];
        }
        
        // Generate a new leaderboard
        const newLeaderboard = generateMockLeaderboard(filter);
        
        // Update the store
        set(state => ({
          leaderboards: {
            ...state.leaderboards,
            [key]: newLeaderboard
          }
        }));
        
        return newLeaderboard;
      },
      
      updateUserScore: (challengeId, score) => {
        // Only update if the new score is better than the previous best
        set(state => {
          const currentBest = state.userBestScores[challengeId] || 0;
          if (score > currentBest) {
            return {
              userBestScores: {
                ...state.userBestScores,
                [challengeId]: score
              }
            };
          }
          return state;
        });
        
        // Update leaderboards that might include this challenge
        // In a real implementation, this would make an API call
        // For now, we'll just regenerate the mock leaderboards
        set(state => {
          const updatedLeaderboards = { ...state.leaderboards };
          
          // Update global leaderboard to include the new score
          const globalKey = `global_${state.currentFilter.timeframe}_all`;
          if (updatedLeaderboards[globalKey]) {
            const entries = updatedLeaderboards[globalKey].entries.map(entry => {
              if (entry.isCurrentUser) {
                return { ...entry, score: Math.max(entry.score, score) };
              }
              return entry;
            });
            
            updatedLeaderboards[globalKey] = {
              ...updatedLeaderboards[globalKey],
              entries: entries.sort((a, b) => b.score - a.score).map((entry, index) => ({
                ...entry,
                rank: index + 1
              }))
            };
          }
          
          return { leaderboards: updatedLeaderboards };
        });
      },
      
      setLeaderboardFilter: (filter) => {
        set(state => ({
          currentFilter: {
            ...state.currentFilter,
            ...filter
          }
        }));
      },
      
      resetLeaderboards: () => {
        set({
          leaderboards: {},
          userBestScores: {}
        });
      }
    }),
    {
      name: 'ai-fight-club-leaderboard-storage',
      partialize: (state) => ({
        userBestScores: state.userBestScores,
        currentFilter: state.currentFilter
      })
    }
  )
);
