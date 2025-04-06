# AI Fight Club - Enhanced Frontend

This enhanced version of the AI Fight Club frontend includes several new engagement and progression features:

1. **AI Rival System** - Personalized opponents based on user traits
2. **Achievement Badge System** - Rewards for specific accomplishments
3. **Challenge Leaderboards** - Competitive elements showing player rankings
4. **Neural Network Progression System** - Visual representation of cognitive growth

## Features Overview

### AI Rival System
- Generates personalized AI rivals based on user assessment results
- Rivals have unique personalities, strengths, and weaknesses
- Rivals compete against users in challenges and provide feedback
- Customizable rivalry styles and difficulty levels

### Achievement Badge System
- 20 unique achievements across different categories (cognitive, creative, analytical, social, achievement, mastery)
- Multiple badge tiers (bronze, silver, gold, platinum)
- Progress tracking for incomplete badges
- Badge notifications when unlocked

### Challenge Leaderboards
- Global, similar-profile, and focus-specific leaderboards
- Time-based filtering (daily, weekly, monthly, all-time)
- Shows user's position relative to others
- Updates after each challenge completion

### Neural Network Progression System
- Visual representation of cognitive abilities as an interactive neural network
- Nodes represent different cognitive domains (memory, creativity, logic, pattern recognition, speed)
- Network grows and evolves based on challenge performance
- Detailed statistics and growth recommendations

## Implementation Details

The implementation uses:
- React with Next.js for the frontend framework
- Zustand for state management
- Tailwind CSS for styling
- D3.js for neural network visualization
- Mock API endpoints for data persistence

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Pages

- `/` - Welcome page and game start
- `/assessment` - User trait assessment
- `/focus` - Focus area selection
- `/round1`, `/round2`, `/round3` - Challenge rounds
- `/results` - Challenge results with rival comparison
- `/profile` - User profile with all progression systems
- `/test` - Test page to validate all features

## Architecture

The codebase follows a modular architecture:
- `/types` - TypeScript type definitions
- `/services` - Business logic and data processing
- `/store` - Zustand state management
- `/components` - Reusable UI components
- `/features` - Page-specific components
- `/lib` - Utility functions and mock API

## Mock API

The application includes mock API endpoints for all features:
- Rival generation and updates
- Badge collection and progress
- Leaderboard data and submissions
- Neural network creation and updates

These endpoints simulate server-side functionality and can be replaced with real backend integration.
