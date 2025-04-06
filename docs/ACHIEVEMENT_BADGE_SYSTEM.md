# Achievement Badge System Documentation

## Overview
The Achievement Badge System rewards users for specific accomplishments throughout their game journey. It provides a sense of progression, encourages exploration of different game aspects, and increases engagement through collectible achievements.

## Key Components

### 1. Badge Categories
- **Cognitive**: Rewards for adaptability, mental resilience, and processing speed
- **Creative**: Rewards for innovative thinking, pattern connection, and divergent thinking
- **Analytical**: Rewards for precision, logic, and efficiency
- **Social**: Rewards for rival interactions and collaborative traits
- **Achievement**: Rewards for perfect scores, consistency, and exploration
- **Mastery**: Secret badges that unlock after achieving multiple other badges

### 2. Badge Tiers
- **Bronze**: Entry-level achievements with easier unlock conditions
- **Silver**: Intermediate achievements requiring moderate skill
- **Gold**: Advanced achievements requiring significant skill
- **Platinum**: Expert-level achievements for exceptional performance

### 3. Badge Progression
- **Progress Tracking**: Each badge shows progress toward completion
- **Unlock Notifications**: Users receive notifications when badges are unlocked
- **Secret Badges**: Some badges remain hidden until specific conditions are met

## Technical Implementation

### Data Structure
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
  unlockedAt?: string;
  progress?: number; // 0-100 percentage
  requirement: string;
  secret?: boolean; // If true, details are hidden until unlocked
}

interface BadgeCollection {
  userId: string;
  unlockedBadges: Badge[];
  inProgressBadges: Badge[];
  totalBadges: number;
  totalUnlocked: number;
}
```

### State Management
The badge system uses Zustand for state management with the following key functions:
- `initializeBadges`: Creates initial badge collection for a user
- `updateBadges`: Checks for newly unlocked badges and updates progress
- `clearRecentlyUnlocked`: Clears notification queue after displaying

### Badge Unlock Conditions
The system checks various conditions to unlock badges:
- Score thresholds in specific rounds
- Time efficiency in completing challenges
- Improvement between rounds
- Beating the AI rival
- Trait balance and distribution
- Consistency across multiple rounds
- Exploration of different focus areas

### Integration Points
- **Round Completion**: Badge progress is updated after each round
- **Results Page**: Newly unlocked badges are displayed
- **Profile Page**: Complete badge collection is available for viewing
- **Game Integration**: Badge notifications appear during gameplay

## User Experience Flow
1. User starts with all badges locked but visible (except secret badges)
2. As user completes challenges, badge progress updates
3. When a badge unlocks, user receives a notification
4. User can view all badges and progress on the profile page
5. Secret badges appear once certain conditions are met
6. Badge collection grows as user explores different aspects of the game

## Mock API Endpoints
- `getBadgeCollection`: Gets a user's badge collection
- `checkBadgeUnlocks`: Checks for newly unlocked badges
- `updateBadgeProgress`: Updates progress for a specific badge

## UI Components
- `BadgeItem`: Displays individual badge with progress
- `BadgeCollection`: Displays all badges with filtering options
- `BadgeNotification`: Shows notification when badge is unlocked
