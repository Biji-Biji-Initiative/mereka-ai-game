import React from 'react';
import { useRivalStore } from '@/store/rival-store';
import { useGameStore } from '@/store/useGameStore';

interface RivalComparisonProps {
  roundNumber: number;
  userScore: number;
}

export function RivalComparison({ roundNumber, userScore }: RivalComparisonProps) {
  const currentRival = useRivalStore(state => state.currentRival);
  const updateRivalPerformance = useRivalStore(state => state.updateRivalPerformance);
  
  // Generate a rival score based on their prediction and some randomness
  React.useEffect(() => {
    if (!currentRival) return;
    
    const roundKey = `round${roundNumber}` as 'round1' | 'round2' | 'round3';
    const prediction = currentRival.predictions[roundKey] || 75;
    
    // Add some randomness to the prediction (±10%)
    const randomVariation = Math.floor(Math.random() * 20) - 10;
    const rivalScore = Math.max(30, Math.min(100, prediction + randomVariation));
    
    // Update the rival's performance
    updateRivalPerformance(roundKey, rivalScore);
  }, [roundNumber, currentRival, updateRivalPerformance]);
  
  if (!currentRival) return null;
  
  const roundKey = `round${roundNumber}` as 'round1' | 'round2' | 'round3';
  const rivalScore = currentRival.performance[roundKey] || 0;
  const rivalPrediction = currentRival.predictions[roundKey] || 0;
  
  // Determine winner
  let userWon = false;
  let tie = false;
  if (userScore !== undefined && rivalScore !== undefined) {
    if (userScore > rivalScore) {
      userWon = true;
    }
    if (userScore === rivalScore) {
      tie = true;
    }
  } else {
    // If scores are missing, consider it a tie or handle appropriately
    tie = true;
  }
  
  // Get a random message from the rival
  const getMessage = () => {
    if (!currentRival) return '';
    
    if (userWon) {
      // User outperformed the rival, show an encouragement message
      const messages = currentRival.encouragementMessages;
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      // Rival outperformed the user, show a taunt message
      const messages = currentRival.tauntMessages;
      return messages[Math.floor(Math.random() * messages.length)];
    }
  };
  
  return (
    <div className="rival-comparison glass p-4 rounded-lg mt-6">
      <h3 className="text-lg font-semibold mb-3 neon-text">Round {roundNumber} Performance</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{userScore}%</div>
          <div className="text-sm text-muted-foreground">Your Score</div>
        </div>
        
        <div className="comparison-indicator">
          {userWon ? (
            <span className="text-green-500">+{userScore - rivalScore}%</span>
          ) : tie ? (
            <span className="text-yellow-500">Tie</span>
          ) : (
            <span className="text-red-500">{userScore - rivalScore}%</span>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">{rivalScore}%</div>
          <div className="text-sm text-muted-foreground">{currentRival.name}</div>
        </div>
      </div>
      
      <div className="comparison-bar mb-4">
        <div 
          className="user-score-fill"
          style={{width: `${userScore}%`}}
        ></div>
        <div 
          className="rival-score-fill"
          style={{width: `${rivalScore}%`}}
        ></div>
      </div>
      
      <div className="rival-message p-3 border border-border/30 rounded-lg">
        <div className="flex items-start">
          <div className="rival-avatar-small mr-3">
            {currentRival.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium mb-1">{currentRival.name}</div>
            <p className="text-sm">{getMessage()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
