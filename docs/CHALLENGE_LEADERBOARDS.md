# Challenge Leaderboards Documentation

## Overview
The Challenge Leaderboards system adds a competitive element to the game by showing how users compare to others. It provides motivation through social comparison and encourages users to improve their performance to climb the rankings.

## Key Components

### 1. Leaderboard Types
- **Global**: Shows rankings across all users
- **Similar Profiles**: Shows rankings among users with similar trait profiles
- **Focus Area**: Shows rankings specific to a particular focus area
- **Challenge**: Shows rankings for a specific challenge

### 2. Timeframe Filtering
- **All Time**: Overall best performances
- **Monthly**: Best performances in the current month
- **Weekly**: Best performances in the current week
- **Daily**: Best performances in the current day

### 3. User Position Tracking
- **Current Position**: Shows user's current rank on the leaderboard
- **Position Changes**: Tracks changes in position over time
- **Score Comparison**: Shows how close user is to next rank

## Technical Implementation

### Data Structure
```typescript
interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  completedAt: string;
  focusArea?: string;
  rank?: number;
  isCurrentUser?: boolean;
}

interface Leaderboard {
  id: string;
  title: string;
  description: string;
  entries: LeaderboardEntry[];
  totalEntries: number;
  lastUpdated: string;
  type: LeaderboardType;
  timeframe: LeaderboardTimeframe;
}
```

### State Management
The leaderboard system uses Zustand for state management with the following key functions:
- `fetchLeaderboard`: Gets leaderboard data based on type and filters
- `updateUserScore`: Updates user's score on relevant leaderboards
- `setLeaderboardFilter`: Changes the current filter settings

### Leaderboard Generation
For the mock implementation, leaderboards are generated with:
- Realistic score distribution (higher ranks have higher scores)
- Appropriate time distribution based on timeframe
- Random user placement to simulate competition
- Focus area distribution to match the selected filter

### Integration Points
- **Round Completion**: User scores are submitted to leaderboards
- **Results Page**: User's position is displayed after each round
- **Profile Page**: Full leaderboards are available for viewing
- **Game Integration**: Leaderboard updates occur automatically

## User Experience Flow
1. User completes a challenge round
2. Score is automatically submitted to relevant leaderboards
3. User sees their position on the leaderboard after the round
4. On the profile page, user can explore different leaderboard types
5. User can filter leaderboards by timeframe to see different rankings
6. As user improves, their position on leaderboards changes

## Mock API Endpoints
- `getLeaderboard`: Gets leaderboard data based on filters
- `submitScore`: Submits a new score to the leaderboard
- `getUserLeaderboardPosition`: Gets user's position on a specific leaderboard

## UI Components
- `LeaderboardRow`: Displays individual leaderboard entry
- `LeaderboardDisplay`: Shows complete leaderboard with filtering options
