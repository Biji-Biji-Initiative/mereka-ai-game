import React from 'react';
import { LeaderboardEntry } from '@/types/leaderboard';
import { Card, CardContent } from '@/components/ui/card';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  highlightCurrentUser?: boolean;
}

export function LeaderboardRow({ entry, highlightCurrentUser = true }: LeaderboardRowProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Determine rank color
  let rankColor = "text-gray-500";
  if (entry.rank === 1) {
    rankColor = "text-yellow-400"; // Gold
  }
  if (entry.rank === 2) {
    rankColor = "text-gray-400"; // Silver
  }
  if (entry.rank === 3) {
    rankColor = "text-yellow-600"; // Bronze
  }
  
  return (
    <div className={`leaderboard-row ${entry.isCurrentUser && highlightCurrentUser ? 'current-user' : ''} ${rankColor}`}>
      <div className="rank">
        <span>{entry.rank}</span>
      </div>
      
      <div className="user-info">
        <div className="avatar">
          {entry.avatarUrl ? (
            <img src={entry.avatarUrl} alt={entry.username} />
          ) : (
            <div className="avatar-placeholder">
              {entry.username.charAt(0)}
            </div>
          )}
        </div>
        <div className="username">
          {entry.username}
          {entry.isCurrentUser && <span className="current-user-badge">You</span>}
        </div>
      </div>
      
      <div className="score">
        <span className="score-value">{entry.score}%</span>
      </div>
      
      <div className="focus-area">
        {entry.focusArea && (
          <span className={`focus-${entry.focusArea}`}>
            {entry.focusArea}
          </span>
        )}
      </div>
      
      <div className="completed-at">
        {formatDate(entry.completedAt)}
      </div>
    </div>
  );
}
