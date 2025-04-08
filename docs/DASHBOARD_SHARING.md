# Dashboard and Results Sharing Documentation

## Overview

This document outlines the dashboard and results sharing implementation for the Mereka AI Game, focusing on user progress tracking, statistics visualization, and social sharing functionality.

## Dashboard System

### Dashboard Data Structure

The dashboard system uses the following data structures:

```typescript
// src/types/dashboard.ts
export interface UserStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  completedChallenges: number;
  focusAreaDistribution: Record<string, number>;
  badgeCount: number;
  humanEdgeTrend: {
    date: string;
    value: number;
  }[];
}

export interface GameHistory {
  id: string;
  completedAt: string;
  score: number;
  humanEdgeRating: number;
  focusArea: string;
  badges: string[];
}

export interface DashboardData {
  stats: UserStats;
  recentGames: GameHistory[];
  achievements: {
    name: string;
    description: string;
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
  }[];
}
```

### Dashboard Service

The dashboard service provides the following endpoints:

```typescript
// src/services/api/services/dashboardService.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import type { DashboardData } from '@/types/dashboard';

// Get user dashboard data
export const useGetDashboardData = (userId: string) => {
  return useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => apiClient.call<DashboardData>(
      mockEndpoints.getDashboardData,
      `/users/${userId}/dashboard`,
      'GET'
    ),
    enabled: !!userId,
  });
};
```

### Mock Implementation

During development, the dashboard system uses mock data:

```typescript
// src/services/api/mock/dashboard.ts
import { ApiResponse } from '@/types/api';
import { DashboardData } from '@/types/dashboard';
import { delay } from '@/services/api/utils/mock-utils';

// Generate mock dashboard data
export const getDashboardData = (userId: string): ApiResponse<DashboardData> => {
  delay(600, 1200);
  
  // Generate realistic mock data based on userId
  const mockData: DashboardData = {
    stats: {
      totalGames: 12,
      averageScore: 78,
      highestScore: 95,
      completedChallenges: 36,
      focusAreaDistribution: {
        'Creative Problem Solving': 5,
        'Ethical Decision Making': 3,
        'Strategic Planning': 4,
      },
      badgeCount: 8,
      humanEdgeTrend: [
        { date: '2025-01-01', value: 65 },
        { date: '2025-02-01', value: 72 },
        { date: '2025-03-01', value: 78 },
        { date: '2025-04-01', value: 85 },
      ],
    },
    recentGames: [
      {
        id: 'game1',
        completedAt: '2025-04-01T14:30:00Z',
        score: 92,
        humanEdgeRating: 88,
        focusArea: 'Creative Problem Solving',
        badges: ['Creative Thinker', 'Human Edge Champion'],
      },
      {
        id: 'game2',
        completedAt: '2025-03-25T10:15:00Z',
        score: 85,
        humanEdgeRating: 82,
        focusArea: 'Ethical Decision Making',
        badges: ['Ethical Reasoner'],
      },
      {
        id: 'game3',
        completedAt: '2025-03-18T16:45:00Z',
        score: 78,
        humanEdgeRating: 75,
        focusArea: 'Strategic Planning',
        badges: ['Strategic Thinker'],
      },
    ],
    achievements: [
      {
        name: 'Game Master',
        description: 'Complete 20 games',
        unlocked: false,
        progress: 12,
        maxProgress: 20,
      },
      {
        name: 'Perfect Score',
        description: 'Achieve a score of 100',
        unlocked: false,
        progress: 95,
        maxProgress: 100,
      },
      {
        name: 'Badge Collector',
        description: 'Earn 10 different badges',
        unlocked: false,
        progress: 8,
        maxProgress: 10,
      },
      {
        name: 'Focus Explorer',
        description: 'Try all focus areas',
        unlocked: true,
      },
    ],
  };
  
  return {
    success: true,
    status: 200,
    data: mockData,
  };
};
```

## Dashboard Components

### Dashboard Overview

The main dashboard component displays user statistics and recent activity:

```tsx
// src/features/dashboard/DashboardOverview.tsx
import { useEffect, useState } from 'react';
import { useGetDashboardData } from '@/services/api/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import { DashboardData } from '@/types/dashboard';
import { StatsCards } from './StatsCards';
import { GameHistoryList } from './GameHistoryList';
import { AchievementsList } from './AchievementsList';
import { HumanEdgeTrendChart } from './HumanEdgeTrendChart';

export const DashboardOverview = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useGetDashboardData(user?.id);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  useEffect(() => {
    if (data?.data) {
      setDashboardData(data.data);
    }
  }, [data]);
  
  if (isLoading) {
    return <div>Loading your dashboard...</div>;
  }
  
  if (error) {
    return <div>Error loading dashboard: {error.message}</div>;
  }
  
  if (!dashboardData) {
    return <div>No dashboard data available.</div>;
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Dashboard</h1>
      
      <StatsCards stats={dashboardData.stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Human Edge Trend</h2>
          <HumanEdgeTrendChart data={dashboardData.stats.humanEdgeTrend} />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Focus Area Distribution</h2>
          <FocusAreaChart distribution={dashboardData.stats.focusAreaDistribution} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Games</h2>
          <GameHistoryList games={dashboardData.recentGames} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Achievements</h2>
          <AchievementsList achievements={dashboardData.achievements} />
        </div>
      </div>
    </div>
  );
};
```

### Stats Cards

The stats cards component displays key user statistics:

```tsx
// src/features/dashboard/StatsCards.tsx
import { UserStats } from '@/types/dashboard';

interface StatsCardsProps {
  stats: UserStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">Total Games</div>
        <div className="text-3xl font-bold mt-2">{stats.totalGames}</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
        <div className="text-3xl font-bold mt-2">{stats.averageScore}</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">Highest Score</div>
        <div className="text-3xl font-bold mt-2">{stats.highestScore}</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</div>
        <div className="text-3xl font-bold mt-2">{stats.badgeCount}</div>
      </div>
    </div>
  );
};
```

## Results Sharing System

### Sharing Data Structure

The results sharing system uses the following data structures:

```typescript
// src/types/sharing.ts
export interface ShareableResult {
  id: string;
  userId: string;
  userName: string;
  score: number;
  humanEdgeRating: number;
  focusArea: string;
  badges: string[];
  createdAt: string;
  shareUrl?: string;
  previewImage?: string;
}

export interface SharingOptions {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy';
  message?: string;
  includeScore: boolean;
  includeBadges: boolean;
}
```

### Sharing Service

The sharing service provides the following endpoints:

```typescript
// src/services/api/services/sharingService.ts
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import type { ShareableResult, SharingOptions } from '@/types/sharing';

// Generate shareable link
export const useGenerateShareableLink = () => {
  return useMutation({
    mutationFn: (gameId: string) => 
      apiClient.call<ShareableResult>(
        mockEndpoints.generateShareableLink,
        `/games/${gameId}/share`,
        'POST'
      ),
  });
};

// Share result to platform
export const useShareResult = () => {
  return useMutation({
    mutationFn: (data: { gameId: string, options: SharingOptions }) => 
      apiClient.call<{ success: boolean }>(
        mockEndpoints.shareResult,
        `/games/${data.gameId}/share/${data.options.platform}`,
        'POST',
        { options: data.options }
      ),
  });
};
```

### Mock Implementation

During development, the sharing system uses mock implementations:

```typescript
// src/services/api/mock/sharing.ts
import { ApiResponse } from '@/types/api';
import { ShareableResult, SharingOptions } from '@/types/sharing';
import { delay } from '@/services/api/utils/mock-utils';

// Generate shareable link
export const generateShareableLink = (gameId: string): ApiResponse<ShareableResult> => {
  delay(500, 1000);
  
  // Mock result data
  const mockResult: ShareableResult = {
    id: gameId,
    userId: '101',
    userName: 'Alex Johnson',
    score: 92,
    humanEdgeRating: 88,
    focusArea: 'Creative Problem Solving',
    badges: ['Creative Thinker', 'Human Edge Champion'],
    createdAt: '2025-04-01T14:30:00Z',
    shareUrl: `https://ai-fight-club.example.com/shared/result/${gameId}`,
    previewImage: `https://ai-fight-club.example.com/api/preview/${gameId}.png`,
  };
  
  return {
    success: true,
    status: 200,
    data: mockResult,
  };
};

// Share result to platform
export const shareResult = (data: { gameId: string, options: SharingOptions }): ApiResponse<{ success: boolean }> => {
  delay(800, 1500);
  
  // In a real implementation, this would integrate with social platform APIs
  console.log(`Sharing game ${data.gameId} to ${data.options.platform}`);
  console.log('Options:', data.options);
  
  return {
    success: true,
    status: 200,
    data: { success: true },
  };
};
```

## Sharing Components

### Share Results Button

The share results button component allows users to share their results:

```tsx
// src/features/results/ShareResultsButton.tsx
import { useState } from 'react';
import { useGenerateShareableLink, useShareResult } from '@/services/api/services/sharingService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SharingOptions } from '@/types/sharing';
import { SharePlatformButtons } from './SharePlatformButtons';
import { SharePreview } from './SharePreview';

interface ShareResultsButtonProps {
  gameId: string;
}

export const ShareResultsButton = ({ gameId }: ShareResultsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareableResult, setShareableResult] = useState(null);
  const [sharingOptions, setSharingOptions] = useState<SharingOptions>({
    platform: 'twitter',
    includeScore: true,
    includeBadges: true,
  });
  
  const generateLink = useGenerateShareableLink();
  const shareResult = useShareResult();
  
  const handleOpenShare = async () => {
    if (!shareableResult) {
      const result = await generateLink.mutateAsync(gameId);
      if (result?.data) {
        setShareableResult(result.data);
      }
    }
    setIsOpen(true);
  };
  
  const handleShare = async (platform: SharingOptions['platform']) => {
    const options = {
      ...sharingOptions,
      platform,
    };
    
    await shareResult.mutateAsync({ gameId, options });
    
    // Handle different platforms
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareableResult.shareUrl);
      // Show toast notification
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=My AI Fight Club Results&body=Check out my results: ${shareableResult.shareUrl}`;
    } else {
      // For social platforms, open share dialog
      window.open(getSocialShareUrl(platform, shareableResult), '_blank');
    }
  };
  
  const getSocialShareUrl = (platform, result) => {
    const baseUrl = result.shareUrl;
    const text = `I scored ${result.score} in AI Fight Club with a Human Edge Rating of ${result.humanEdgeRating}!`;
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(baseUrl)}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
      default:
        return '';
    }
  };
  
  return (
    <>
      <Button 
        onClick={handleOpenShare}
        className="flex items-center gap-2"
      >
        <ShareIcon className="w-5 h-5" />
        Share Results
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Results</DialogTitle>
          </DialogHeader>
          
          {shareableResult && (
            <>
              <SharePreview result={shareableResult} options={sharingOptions} />
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <SharePlatformButtons onShare={handleShare} />
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Sharing Options</div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sharingOptions.includeScore}
                        onChange={(e) => setSharingOptions({
                          ...sharingOptions,
                          includeScore: e.target.checked,
                        })}
                      />
                      Include score
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sharingOptions.includeBadges}
                        onChange={(e) => setSharingOptions({
                          ...sharingOptions,
                          includeBadges: e.target.checked,
                        })}
                      />
                      Include badges
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {generateLink.isLoading && (
            <div className="text-center py-4">Generating shareable link...</div>
          )}
          
          {generateLink.isError && (
            <div className="text-center py-4 text-red-500">
              Error generating link: {generateLink.error.message}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
```

### Share Preview

The share preview component displays a preview of the shared content:

```tsx
// src/features/results/SharePreview.tsx
import { ShareableResult, SharingOptions } from '@/types/sharing';

interface SharePreviewProps {
  result: ShareableResult;
  options: SharingOptions;
}

export const SharePreview = ({ result, options }: SharePreviewProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div className="text-lg font-semibold mb-2">
        {result.userName}'s AI Fight Club Results
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Focus Area: {result.focusArea}
      </div>
      
      {options.includeScore && (
        <div className="flex justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
            <div className="text-xl font-bold">{result.score}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Human Edge</div>
            <div className="text-xl font-bold">{result.humanEdgeRating}</div>
          </div>
        </div>
      )}
      
      {options.includeBadges && result.badges.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Badges Earned</div>
          <div className="flex flex-wrap gap-1">
            {result.badges.map(badge => (
              <span 
                key={badge} 
                className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Shared from AI Fight Club on {new Date(result.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};
```

## Integration with Game Flow

### Dashboard Access

The dashboard is accessible from the navigation menu and results page:

```tsx
// src/components/layout/Navigation.tsx
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export const Navigation = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <nav className="space-y-2">
      {/* Other navigation items */}
      
      {isAuthenticated && (
        <Link 
          href="/dashboard"
          className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <DashboardIcon className="w-5 h-5 mr-2" />
          Dashboard
        </Link>
      )}
    </nav>
  );
};
```

### Results Sharing Integration

The results page includes sharing functionality:

```tsx
// src/features/results/ResultsPage.tsx
import { useGameStore } from '@/store/useGameStore';
import { ShareResultsButton } from './ShareResultsButton';

export const ResultsPage = () => {
  const { gameId } = useGameStore();
  
  // Rest of the component...
  
  return (
    <div className="space-y-8">
      {/* Results content */}
      
      <div className="flex justify-center mt-6">
        <ShareResultsButton gameId={gameId} />
      </div>
    </div>
  );
};
```

## Testing Dashboard and Sharing Components

The dashboard and sharing components can be tested using the following approaches:

```typescript
// src/tests/unit/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardOverview } from '@/features/dashboard/DashboardOverview';
import { useGetDashboardData } from '@/services/api/services/dashboardService';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Mock the dashboard service
jest.mock('@/services/api/services/dashboardService', () => ({
  useGetDashboardData: jest.fn(),
}));

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '101', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

describe('Dashboard', () => {
  it('should render dashboard data', async () => {
    // Mock successful response
    (useGetDashboardData as jest.Mock).mockReturnValue({
      data: {
        data: {
          stats: {
            totalGames: 12,
            averageScore: 78,
            highestScore: 95,
            badgeCount: 8,
            // Other stats...
          },
          recentGames: [
            // Mock games...
          ],
          achievements: [
            // Mock achievements...
          ],
        },
      },
      isLoading: false,
      error: null,
    });
    
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardOverview />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Your Dashboard')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // Total games
      expect(screen.getByText('78')).toBeInTheDocument(); // Average score
      expect(screen.getByText('95')).toBeInTheDocument(); // Highest score
    });
  });
});
```

## Transitioning to Backend Integration

When integrating with a real backend:

1. Replace mock dashboard and sharing services with real API calls
2. Implement proper error handling for API failures
3. Add caching for dashboard data to improve performance
4. Implement real social sharing integrations

The dashboard and sharing systems are designed with a clean separation of concerns to make this transition seamless.
