'use client';

import React, { useState, useEffect } from 'react';
import { Leaderboard, LeaderboardType, LeaderboardTimeframe, LeaderboardFilter } from '@/types/leaderboard';
import { LeaderboardRow } from './LeaderboardRow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLeaderboardStore } from '@/store/leaderboard-store';

interface LeaderboardDisplayProps {
  initialType?: LeaderboardType;
  initialTimeframe?: LeaderboardTimeframe;
  focusArea?: string;
  challengeId?: string;
  showFilters?: boolean;
  maxEntries?: number;
  className?: string;
}

export function LeaderboardDisplay({ 
  initialType = 'global',
  initialTimeframe = 'all_time',
  focusArea,
  challengeId,
  showFilters = true,
  maxEntries = 10,
  className = ''
}: LeaderboardDisplayProps) {
  // State for selected filters
  const [selectedType, setSelectedType] = useState<LeaderboardType>(initialType);
  const [selectedTimeframe, setSelectedTimeframe] = useState<LeaderboardTimeframe>(initialTimeframe);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get leaderboard data from store
  const fetchLeaderboard = useLeaderboardStore(state => state.fetchLeaderboard);
  const setLeaderboardFilter = useLeaderboardStore(state => state.setLeaderboardFilter);
  const currentFilter = useLeaderboardStore(state => state.currentFilter);
  
  // Fetch leaderboard data
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Update global filter settings
    setLeaderboardFilter({
      type: selectedType,
      timeframe: selectedTimeframe,
      focusArea,
      limit: maxEntries
    });
    
    // Fetch leaderboard data
    const data = fetchLeaderboard(selectedType, selectedTimeframe, focusArea);
    setLeaderboard(data);
    
    setIsLoading(false);
  }, [selectedType, selectedTimeframe, focusArea, maxEntries, fetchLeaderboard, setLeaderboardFilter]);
  
  // Handle type change
  const handleTypeChange = (type: LeaderboardType) => {
    setSelectedType(type);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (timeframe: LeaderboardTimeframe) => {
    setSelectedTimeframe(timeframe);
  };
  
  // Find current user's position
  const currentUserEntry = leaderboard?.entries.find(entry => entry.isCurrentUser);
  
  return (
    <Card className={`leaderboard-display ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold neon-text">
          {leaderboard?.title || 'Leaderboard'}
        </CardTitle>
        <CardDescription>
          {leaderboard?.description || 'See how you compare to other players'}
        </CardDescription>
      </CardHeader>
      
      {showFilters && (
        <div className="leaderboard-filters px-6 pb-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Leaderboard Type</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === 'global' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange('global')}
                  className="flex-1"
                >
                  Global
                </Button>
                <Button
                  variant={selectedType === 'similar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange('similar')}
                  className="flex-1"
                >
                  Similar Profiles
                </Button>
                <Button
                  variant={selectedType === 'focus' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange('focus')}
                  className="flex-1"
                >
                  By Focus
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Time Period</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTimeframe === 'all_time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('all_time')}
                  className="flex-1"
                >
                  All Time
                </Button>
                <Button
                  variant={selectedTimeframe === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('monthly')}
                  className="flex-1"
                >
                  Monthly
                </Button>
                <Button
                  variant={selectedTimeframe === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('weekly')}
                  className="flex-1"
                >
                  Weekly
                </Button>
                <Button
                  variant={selectedTimeframe === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('daily')}
                  className="flex-1"
                >
                  Daily
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <CardContent>
        {isLoading ? (
          <div className="leaderboard-loading p-6 text-center">
            <div className="loading-spinner mb-2"></div>
            <p>Loading leaderboard data...</p>
          </div>
        ) : leaderboard?.entries.length === 0 ? (
          <div className="leaderboard-empty p-6 text-center">
            <p>No leaderboard data available for the selected filters.</p>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <div className="rank">Rank</div>
              <div className="user-info">Player</div>
              <div className="score">Score</div>
              <div className="focus-area">Focus</div>
              <div className="completed-at">Date</div>
            </div>
            
            <div className="leaderboard-body">
              {leaderboard?.entries.slice(0, maxEntries).map(entry => (
                <LeaderboardRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
        
        {currentUserEntry && (
          <div className="current-user-position mt-4 p-4 glass rounded-lg">
            <h3 className="text-sm font-medium mb-2">Your Position</h3>
            <LeaderboardRow entry={currentUserEntry} highlightCurrentUser={false} />
          </div>
        )}
        
        <div className="leaderboard-footer mt-4 text-center text-sm text-muted-foreground">
          <p>Last updated: {leaderboard ? new Date(leaderboard.lastUpdated).toLocaleString() : 'Never'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
