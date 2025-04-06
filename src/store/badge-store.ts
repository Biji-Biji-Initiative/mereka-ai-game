import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Badge, 
  BadgeCollection,
  BadgeUnlockEvent
} from '@/types/badge';
import { 
  AVAILABLE_BADGES,
  createInitialBadgeCollection,
  updateBadgeProgress,
  checkBadgeUnlock
} from '@/services/badgeService';

interface BadgeState {
  // Current badge collection
  badgeCollection: BadgeCollection | null;
  
  // Badge unlock history
  unlockHistory: BadgeUnlockEvent[];
  
  // Recently unlocked badges (for notifications)
  recentlyUnlocked: Badge[];
  
  // Actions
  initializeBadges: (userId: string) => void;
  updateBadges: (gameState: any, rivalState: any) => void;
  clearRecentlyUnlocked: () => void;
  resetBadges: () => void;
}

// Initial state
const initialState = {
  badgeCollection: null,
  unlockHistory: [],
  recentlyUnlocked: [],
};

// Create the badge store
export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      initializeBadges: (userId: string) => {
        // Only initialize if no collection exists or user ID changed
        const currentCollection = get().badgeCollection;
        if (!currentCollection || currentCollection.userId !== userId) {
          set({ 
            badgeCollection: createInitialBadgeCollection(userId),
            unlockHistory: [],
            recentlyUnlocked: []
          });
        }
      },
      
      updateBadges: (gameState: any, rivalState: any) => {
        const collection = get().badgeCollection;
        if (!collection) return;
        
        // Update badge progress and check for newly unlocked badges
        const { updatedCollection, newlyUnlocked } = updateBadgeProgress(
          collection,
          gameState,
          rivalState
        );
        
        // Create unlock events for newly unlocked badges
        const newUnlockEvents: BadgeUnlockEvent[] = newlyUnlocked.map(badge => ({
          badgeId: badge.id,
          timestamp: new Date().toISOString(),
          context: {
            gamePhase: gameState.currentStep,
            roundResults: gameState.roundResults
          }
        }));
        
        set({
          badgeCollection: updatedCollection,
          unlockHistory: [...get().unlockHistory, ...newUnlockEvents],
          recentlyUnlocked: [...get().recentlyUnlocked, ...newlyUnlocked]
        });
      },
      
      clearRecentlyUnlocked: () => {
        set({ recentlyUnlocked: [] });
      },
      
      resetBadges: () => {
        set(initialState);
      }
    }),
    {
      name: 'ai-fight-club-badge-storage',
      partialize: (state) => ({
        badgeCollection: state.badgeCollection,
        unlockHistory: state.unlockHistory
      })
    }
  )
);
