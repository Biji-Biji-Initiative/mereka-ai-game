# Leaderboard System Documentation

## Overview

This document outlines the leaderboard system implementation for the Mereka AI Game, focusing on score submission, leaderboard display, user rankings, and integration with the game flow.

## Leaderboard Data Structure

### Score Model

The leaderboard system uses the following data structure for scores:

```typescript
// src/types/leaderboard.ts
export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  score: number;
  humanEdgeRating: number;
  focusArea: string;
  badges: string[];
  createdAt: string;
  rank?: number; // Optional, calculated on the server or client
}

export interface LeaderboardFilter {
  focusArea?: string;
  timeFrame?: 'all' | 'day' | 'week' | 'month';
  limit?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry; // Current user's rank
  total: number;
}
```

## Leaderboard Service

### API Endpoints

The leaderboard service provides the following endpoints:

```typescript
// src/services/api/services/leaderboardService.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import type { LeaderboardEntry, LeaderboardFilter, LeaderboardResponse } from '@/types/leaderboard';

// Get global leaderboard
export const useGetLeaderboard = (filter: LeaderboardFilter = {}) => {
  return useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: () => apiClient.call<LeaderboardResponse>(
      mockEndpoints.getLeaderboard,
      '/leaderboard',
      'GET',
      { filter }
    ),
  });
};

// Get user's personal scores
export const useGetUserScores = (userId: string) => {
  return useQuery({
    queryKey: ['userScores', userId],
    queryFn: () => apiClient.call<LeaderboardEntry[]>(
      mockEndpoints.getUserScores,
      `/users/${userId}/scores`,
      'GET'
    ),
    enabled: !!userId,
  });
};

// Submit a new score
export const useSubmitScore = () => {
  return useMutation({
    mutationFn: (data: Omit<LeaderboardEntry, 'id' | 'createdAt' | 'rank'>) => 
      apiClient.call<LeaderboardEntry>(
        mockEndpoints.submitScore,
        '/leaderboard/scores',
        'POST',
        data
      ),
  });
};
```

### Mock Implementation

During development, the leaderboard system uses mock data:

```typescript
// src/services/api/mock/leaderboard.ts
import { ApiResponse } from '@/types/api';
import { LeaderboardEntry, LeaderboardResponse, LeaderboardFilter } from '@/types/leaderboard';
import { delay } from '@/services/api/utils/mock-utils';

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    userId: '101',
    userName: 'Alex Johnson',
    userImage: '/images/avatars/user1.png',
    score: 95,
    humanEdgeRating: 92,
    focusArea: 'Creative Problem Solving',
    badges: ['Creative Thinker', 'Human Edge Champion'],
    createdAt: '2025-03-15T10:30:00Z',
  },
  // Additional mock entries...
];

// Get leaderboard with optional filtering
export const getLeaderboard = (data: { filter?: LeaderboardFilter }): ApiResponse<LeaderboardResponse> => {
  delay(500, 1000);
  
  let filteredEntries = [...mockLeaderboard];
  const filter = data?.filter || {};
  
  // Apply focus area filter
  if (filter.focusArea) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.focusArea === filter.focusArea
    );
  }
  
  // Apply time frame filter (simplified for mock)
  if (filter.timeFrame && filter.timeFrame !== 'all') {
    const now = new Date();
    let cutoff = new Date();
    
    switch (filter.timeFrame) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }
    
    filteredEntries = filteredEntries.filter(entry => 
      new Date(entry.createdAt) >= cutoff
    );
  }
  
  // Sort by score (descending)
  filteredEntries.sort((a, b) => b.score - a.score);
  
  // Add rank
  filteredEntries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  // Apply limit
  if (filter.limit && filter.limit > 0) {
    filteredEntries = filteredEntries.slice(0, filter.limit);
  }
  
  // Find current user's rank (mock user ID 101)
  const userRank = mockLeaderboard
    .sort((a, b) => b.score - a.score)
    .findIndex(entry => entry.userId === '101') + 1;
  
  const userEntry = mockLeaderboard.find(entry => entry.userId === '101');
  
  return {
    success: true,
    status: 200,
    data: {
      entries: filteredEntries,
      userRank: userEntry ? { ...userEntry, rank: userRank } : undefined,
      total: mockLeaderboard.length,
    }
  };
};

// Get user scores
export const getUserScores = (userId: string): ApiResponse<LeaderboardEntry[]> => {
  delay(300, 800);
  
  const userScores = mockLeaderboard.filter(entry => entry.userId === userId);
  
  return {
    success: true,
    status: 200,
    data: userScores,
  };
};

// Submit score
export const submitScore = (data: Omit<LeaderboardEntry, 'id' | 'createdAt' | 'rank'>): ApiResponse<LeaderboardEntry> => {
  delay(500, 1200);
  
  const newScore: LeaderboardEntry = {
    ...data,
    id: `score-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  // In a real implementation, this would add to the database
  
  return {
    success: true,
    status: 201,
    data: newScore,
  };
};
```

## Leaderboard Store

The application uses a Zustand store for managing leaderboard state:

```typescript
// src/store/leaderboard-store.ts
import { create } from 'zustand';
import type { LeaderboardEntry, LeaderboardFilter } from '@/types/leaderboard';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  filter: LeaderboardFilter;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setEntries: (entries: LeaderboardEntry[]) => void;
  setUserRank: (userRank: LeaderboardEntry | undefined) => void;
  setFilter: (filter: Partial<LeaderboardFilter>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  userRank: undefined,
  filter: {
    timeFrame: 'all',
    limit: 10,
  },
  isLoading: false,
  error: null,
  
  setEntries: (entries) => set({ entries }),
  setUserRank: (userRank) => set({ userRank }),
  setFilter: (filter) => set((state) => ({ 
    filter: { ...state.filter, ...filter } 
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
```

## Leaderboard Components

### Global Leaderboard

The global leaderboard component displays top scores across all users:

```tsx
// src/features/leaderboard/GlobalLeaderboard.tsx
import { useEffect } from 'react';
import { useGetLeaderboard } from '@/services/api/services/leaderboardService';
import { useLeaderboardStore } from '@/store/leaderboard-store';
import { LeaderboardTable } from './LeaderboardTable';
import { LeaderboardFilters } from './LeaderboardFilters';

export const GlobalLeaderboard = () => {
  const { filter, setEntries, setUserRank, setLoading, setError } = useLeaderboardStore();
  const { data, isLoading, error } = useGetLeaderboard(filter);
  
  useEffect(() => {
    setLoading(isLoading);
    
    if (error) {
      setError(error.message);
    } else {
      setError(null);
    }
    
    if (data?.data) {
      setEntries(data.data.entries);
      setUserRank(data.data.userRank);
    }
  }, [data, isLoading, error, setEntries, setUserRank, setLoading, setError]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Global Leaderboard</h2>
      <LeaderboardFilters />
      <LeaderboardTable />
    </div>
  );
};
```

### User Scores

The user scores component displays the current user's personal scores:

```tsx
// src/features/leaderboard/UserScores.tsx
import { useEffect, useState } from 'react';
import { useGetUserScores } from '@/services/api/services/leaderboardService';
import { useAuth } from '@/hooks/useAuth';
import { LeaderboardEntry } from '@/types/leaderboard';
import { UserScoreCard } from './UserScoreCard';

export const UserScores = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useGetUserScores(user?.id);
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  
  useEffect(() => {
    if (data?.data) {
      setScores(data.data);
    }
  }, [data]);
  
  if (isLoading) {
    return <div>Loading your scores...</div>;
  }
  
  if (error) {
    return <div>Error loading scores: {error.message}</div>;
  }
  
  if (scores.length === 0) {
    return <div>You haven't submitted any scores yet. Complete a game to see your scores here!</div>;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Scores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scores.map(score => (
          <UserScoreCard key={score.id} score={score} />
        ))}
      </div>
    </div>
  );
};
```

### Leaderboard Table

The leaderboard table component displays the actual rankings:

```tsx
// src/features/leaderboard/LeaderboardTable.tsx
import { useLeaderboardStore } from '@/store/leaderboard-store';
import { useAuth } from '@/hooks/useAuth';

export const LeaderboardTable = () => {
  const { entries, userRank, isLoading, error } = useLeaderboardStore();
  const { user } = useAuth();
  
  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }
  
  if (error) {
    return <div>Error loading leaderboard: {error}</div>;
  }
  
  if (entries.length === 0) {
    return <div>No scores found for the selected filters.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-3 text-left">Rank</th>
            <th className="p-3 text-left">Player</th>
            <th className="p-3 text-left">Focus Area</th>
            <th className="p-3 text-right">Score</th>
            <th className="p-3 text-right">Human Edge</th>
            <th className="p-3 text-left">Badges</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr 
              key={entry.id}
              className={`border-b border-gray-200 dark:border-gray-700 ${
                entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <td className="p-3">{entry.rank || index + 1}</td>
              <td className="p-3 flex items-center gap-2">
                {entry.userImage && (
                  <img 
                    src={entry.userImage} 
                    alt={entry.userName} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                {entry.userName}
              </td>
              <td className="p-3">{entry.focusArea}</td>
              <td className="p-3 text-right font-semibold">{entry.score}</td>
              <td className="p-3 text-right">{entry.humanEdgeRating}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {entry.badges.map(badge => (
                    <span 
                      key={badge} 
                      className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {userRank && userRank.rank && userRank.rank > 10 && (
        <div className="mt-4 p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="font-semibold">Your Rank</div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{userRank.rank}</span>
              {userRank.userImage && (
                <img 
                  src={userRank.userImage} 
                  alt={userRank.userName} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              {userRank.userName}
            </div>
            <div className="flex items-center gap-4">
              <span>{userRank.focusArea}</span>
              <span className="font-semibold">{userRank.score}</span>
              <span>{userRank.humanEdgeRating}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Integration with Game Flow

The leaderboard system integrates with the game flow in the following ways:

### Score Submission

When a user completes the game, their score is calculated and submitted to the leaderboard:

```tsx
// src/features/results/ResultsPage.tsx
import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSubmitScore } from '@/services/api/services/leaderboardService';
import { useAuth } from '@/hooks/useAuth';

export const ResultsPage = () => {
  const { personality, focus, responses, profile } = useGameStore();
  const { user } = useAuth();
  const submitScore = useSubmitScore();
  
  // Calculate final score based on game results
  const calculateScore = () => {
    // Implementation depends on game scoring logic
    let score = 0;
    
    // Example: Calculate based on traits and responses
    if (personality?.traits) {
      // Add points based on trait values
      score += personality.traits.reduce((sum, trait) => sum + trait.value, 0) / 10;
    }
    
    // Add points for each completed round
    if (responses?.round1?.userResponse) score += 20;
    if (responses?.round2?.userResponse) score += 30;
    if (responses?.round3?.userResponse) score += 50;
    
    return Math.round(score);
  };
  
  // Calculate human edge rating
  const calculateHumanEdgeRating = () => {
    // Implementation depends on game logic
    // Example: Based on profile metrics
    return profile?.metrics?.humanEdge || 75;
  };
  
  // Get earned badges
  const getEarnedBadges = () => {
    return profile?.badges?.map(badge => badge.name) || [];
  };
  
  // Submit score when results are ready
  useEffect(() => {
    if (user && profile && !submitScore.isLoading && !submitScore.isSuccess) {
      const scoreData = {
        userId: user.id,
        userName: user.name || 'Anonymous Player',
        userImage: user.image,
        score: calculateScore(),
        humanEdgeRating: calculateHumanEdgeRating(),
        focusArea: focus?.name || 'General',
        badges: getEarnedBadges(),
      };
      
      submitScore.mutate(scoreData);
    }
  }, [user, profile, submitScore, focus]);
  
  // Rest of the component...
};
```

### Leaderboard Access

Users can access the leaderboard from the results page or navigation menu:

```tsx
// src/components/layout/Navigation.tsx
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export const Navigation = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <nav className="space-y-2">
      {/* Other navigation items */}
      
      <Link 
        href="/leaderboard"
        className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <TrophyIcon className="w-5 h-5 mr-2" />
        Leaderboard
      </Link>
      
      {isAuthenticated && (
        <Link 
          href="/leaderboard/my-scores"
          className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <UserIcon className="w-5 h-5 mr-2" />
          My Scores
        </Link>
      )}
    </nav>
  );
};
```

## Testing Leaderboard Components

The leaderboard system can be tested using the following approaches:

```typescript
// src/tests/unit/leaderboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { GlobalLeaderboard } from '@/features/leaderboard/GlobalLeaderboard';
import { useGetLeaderboard } from '@/services/api/services/leaderboardService';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Mock the leaderboard service
jest.mock('@/services/api/services/leaderboardService', () => ({
  useGetLeaderboard: jest.fn(),
}));

describe('Leaderboard', () => {
  it('should render leaderboard entries', async () => {
    // Mock successful response
    (useGetLeaderboard as jest.Mock).mockReturnValue({
      data: {
        data: {
          entries: [
            {
              id: '1',
              userId: '101',
              userName: 'Test User',
              score: 95,
              humanEdgeRating: 90,
              focusArea: 'Creative Problem Solving',
              badges: ['Creative Thinker'],
              createdAt: '2025-04-01T12:00:00Z',
              rank: 1,
            },
          ],
          total: 1,
        },
      },
      isLoading: false,
      error: null,
    });
    
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <GlobalLeaderboard />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('Creative Problem Solving')).toBeInTheDocument();
      expect(screen.getByText('Creative Thinker')).toBeInTheDocument();
    });
  });
  
  it('should show loading state', async () => {
    // Mock loading state
    (useGetLeaderboard as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <GlobalLeaderboard />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
  });
  
  it('should show error state', async () => {
    // Mock error state
    (useGetLeaderboard as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Failed to load leaderboard' },
    });
    
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <GlobalLeaderboard />
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/Error loading leaderboard/)).toBeInTheDocument();
  });
});
```

## Transitioning to Backend Integration

When integrating with a real backend:

1. Replace mock leaderboard service with real API calls
2. Implement proper error handling for API failures
3. Add pagination for large leaderboard datasets
4. Implement real-time updates for leaderboard changes

The leaderboard system is designed with a clean separation of concerns to make this transition seamless.
