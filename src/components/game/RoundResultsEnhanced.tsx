import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useRivalStore } from '@/store/rival-store';
import { useBadgeStore } from '@/store/badge-store';
import { useLeaderboardStore } from '@/store/leaderboard-store';
import { useNetworkStore } from '@/store/network-store';
import { RivalComparison } from '@/components/rival/RivalComparison';
import { LeaderboardDisplay } from '@/components/leaderboard/LeaderboardDisplay';

interface RoundResultsEnhancedProps {
  roundNumber: number;
  score: number;
  onContinue: () => void;
}

export function RoundResultsEnhanced({ 
  roundNumber, 
  score, 
  onContinue 
}: RoundResultsEnhancedProps) {
  // Get rival state
  const currentRival = useRivalStore(state => state.currentRival);
  
  // Get badge state
  const recentlyUnlocked = useBadgeStore(state => state.recentlyUnlocked);
  
  // Get focus area
  const focus = useGameStore(state => state.focus);
  
  return (
    <div className="round-results-enhanced space-y-6">
      {/* Rival comparison */}
      {currentRival && (
        <RivalComparison 
          roundNumber={roundNumber} 
          userScore={score} 
        />
      )}
      
      {/* Recently unlocked badges */}
      {recentlyUnlocked.length > 0 && (
        <div className="badges-unlocked glass p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 neon-text">Badges Unlocked</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentlyUnlocked.map(badge => (
              <div key={badge.id} className="badge-preview p-3 glass rounded-lg">
                <div className="flex items-center">
                  <div className="badge-icon-small mr-3">{badge.icon}</div>
                  <div>
                    <h4 className="font-medium text-sm">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground">{badge.tier}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Leaderboard position */}
      <LeaderboardDisplay 
        initialType="focus"
        initialTimeframe="weekly"
        focusArea={focus?.id}
        maxEntries={5}
        showFilters={false}
        className="mt-4"
      />
      
      <div className="text-center mt-6">
        <button 
          onClick={onContinue}
          className="btn-primary px-6 py-3 rounded-lg font-bold text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
