# AI Rival System Documentation

## Overview
The AI Rival System creates personalized opponents based on the user's assessment results. These rivals have unique personalities, strengths, and weaknesses that make each user's experience different and engaging.

## Key Components

### 1. Rival Generation
- **Trait-Based Creation**: Rivals are generated based on the user's own trait assessment
- **Personality Types**: Each rival has a distinct personality type that affects their behavior
- **Customizable Difficulty**: Three difficulty levels (easy, medium, hard) affect rival performance
- **Rivalry Styles**: Three styles (friendly, competitive, intense) affect rival messaging and behavior

### 2. Rival Performance
- **Predictive Algorithm**: Rivals have predicted performance for each round based on their traits
- **Dynamic Scoring**: Actual performance varies slightly from predictions to create unpredictability
- **Comparative Analysis**: User performance is directly compared to rival performance after each round

### 3. User Interface
- **RivalCard Component**: Displays rival information, traits, and performance
- **RivalGeneration Component**: Allows customization of rival difficulty and rivalry style
- **RivalComparison Component**: Shows head-to-head comparison after each round

## Technical Implementation

### Data Structure
```typescript
interface Rival {
  id: string;
  name: string;
  personalityType: string;
  description: string;
  traits: RivalTrait[];
  strengths: string[];
  weaknesses: string[];
  encouragementMessages: string[];
  tauntMessages: string[];
  predictions: {
    round1: number;
    round2: number;
    round3: number;
  };
  performance: {
    round1?: number;
    round2?: number;
    round3?: number;
  };
  overallComparison?: {
    userScore: number;
    rivalScore: number;
    difference: number;
    userAdvantageAreas: string[];
    rivalAdvantageAreas: string[];
  };
}
```

### State Management
The rival system uses Zustand for state management with the following key functions:
- `generateNewRival`: Creates a new rival based on user traits
- `updateRivalPerformance`: Updates rival performance after each round
- `setPreferredRivalryStyle`: Changes the rivalry style
- `setPreferredDifficulty`: Changes the difficulty level

### Integration Points
- **Assessment**: Rival is generated after user completes the trait assessment
- **Round Results**: Rival performance is compared to user performance after each round
- **Results Page**: Overall comparison between user and rival is displayed
- **Profile Page**: Detailed rival information and history is available

## User Experience Flow
1. User completes trait assessment
2. System generates a personalized rival
3. User can customize rival difficulty and rivalry style
4. During challenges, user competes against the rival
5. After each round, user sees a comparison with the rival
6. On the results page, user sees an overall comparison
7. User can view detailed rival information on the profile page

## Mock API Endpoints
- `generateRival`: Creates a new rival based on user traits
- `updateRivalPerformance`: Updates rival performance after a round
- `getRival`: Gets rival details by ID
