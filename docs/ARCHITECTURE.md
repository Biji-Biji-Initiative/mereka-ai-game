# Mereka AI Game - Technical Architecture

This document provides an overview of the technical architecture of the Mereka AI Game application.

## Application Structure

The application follows a modern React architecture with Next.js, using the following structure:

```
mereka-ai-game/
├── docs/                  # Documentation files
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── attitudes/     # AI attitudes assessment page
│   │   ├── context/       # User context collection page
│   │   ├── focus/         # Focus area selection page
│   │   ├── results/       # Results display page
│   │   ├── round1/        # First challenge round page
│   │   ├── round2/        # Second challenge round page
│   │   ├── round3/        # Third challenge round page
│   │   └── traits/        # Personality traits assessment page
│   ├── components/        # Reusable UI components
│   │   ├── dev/           # Development tools
│   │   ├── error/         # Error handling components
│   │   ├── game/          # Game-specific components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI component library
│   ├── features/          # Feature modules
│   │   ├── assessment/    # Assessment feature (traits & attitudes)
│   │   ├── dashboard/     # User dashboard feature
│   │   ├── focus/         # Focus selection feature
│   │   ├── leaderboard/   # Leaderboard feature
│   │   ├── onboarding/    # User onboarding feature
│   │   ├── results/       # Results display feature
│   │   ├── rounds/        # Game rounds feature
│   │   └── shared/        # Shared feature components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── logging/       # Enhanced logging system
│   │   ├── fonts.ts       # Font configuration
│   │   ├── schemas.ts     # Data validation schemas
│   │   └── utils.ts       # Utility functions
│   ├── providers/         # React context providers
│   ├── services/          # API and service integrations
│   │   ├── api/           # API client and services
│   │   ├── badgeService/  # Badge system service
│   │   ├── evaluationService/ # Challenge evaluation service
│   │   └── neuralNetwork/ # Neural network implementation
│   └── store/             # State management
│       ├── badge-store.ts # Badge system state
│       ├── leaderboard-store.ts # Leaderboard state
│       └── useGameStore.ts # Main game state
└── ...                    # Configuration files
```

## Technology Stack

- **Framework**: Next.js 15.2.4
- **UI Library**: React 19.1.0
- **Styling**: TailwindCSS 4.1.2 with custom utilities
- **State Management**: Zustand 5.0.3
- **Form Validation**: Zod 3.24.2
- **UI Components**: Custom components built on Radix UI primitives
- **Data Fetching**: TanStack Query 5.71.10
- **Authentication**: NextAuth.js 5.0.0-beta.25
- **Logging**: Custom logging system
- **Neural Network**: TensorFlow.js for AI model implementation
- **Badge System**: Custom achievement tracking system
- **Evaluation Engine**: Challenge response evaluation system

## Key Architecture Patterns

### Component Architecture

The application follows a component-based architecture with:

1. **UI Components**: Reusable, presentational components in `src/components/ui/`
2. **Feature Components**: Business logic components in `src/features/`
3. **Layout Components**: Page structure components in `src/components/layout/`
4. **Provider Components**: Context providers in `src/providers/`
5. **Error Components**: Error handling and boundaries in `src/components/error/`

### State Management

The application uses Zustand for state management with the following stores:

- **Game Store**: Manages game state, including:
  - Current game phase
  - Completed phases
  - User information and context
  - Personality traits assessment results
  - AI attitudes assessment results
  - Selected focus area
  - Challenge responses for each round
  - Game progress and completion status

- **Badge Store**: Manages user achievements and badges:
  - Unlocked badges
  - Badge progress tracking
  - Badge display settings

- **Leaderboard Store**: Manages leaderboard functionality:
  - Global rankings
  - User scores and positions
  - Filtering and sorting options

### Routing

The application uses Next.js App Router with the following structure:

- `/` - Welcome and user onboarding
- `/context` - User context collection
- `/traits` - Personality traits assessment
- `/attitudes` - AI attitudes assessment
- `/focus` - Focus area selection
- `/round1` - First challenge round
- `/round2` - Second challenge round
- `/round3` - Third challenge round
- `/results` - Results display and profile generation
- `/dashboard` - User dashboard and statistics
- `/leaderboard` - Global and personal leaderboards

Each route is designed to ensure users follow the intended game flow, with proper phase transitions managed by the GamePhaseNavigator component.

### Logging System

The enhanced logging system includes:

1. **Logger Core**: Base logging functionality in `src/lib/logging/logger-core.ts`
2. **Log Provider**: React context provider in `src/lib/logging/log-provider.tsx`
3. **Log Types**: Type definitions in `src/lib/logging/types.ts`
4. **Log Debugger**: Visual debugging tool in `src/components/dev/LogDebugger.tsx`

### Neural Network Implementation

The application includes a neural network implementation for AI-related features:

1. **Model Architecture**: TensorFlow.js implementation for challenge generation and evaluation
2. **AI Rivals**: Simulated AI opponents with different personality profiles
3. **Response Analysis**: Natural language processing for evaluating user responses
4. **Human Edge Metrics**: Calculation of user's unique advantages compared to AI approaches

### Badge and Achievement System

The application includes a comprehensive badge system:

1. **Badge Definitions**: Achievement criteria and metadata
2. **Badge Progress**: Real-time tracking of user progress toward badges
3. **Badge Display**: Visual representation of earned and locked badges
4. **Badge Unlocking**: Event-based triggers for badge acquisition

### Styling Approach

The application uses a custom TailwindCSS configuration with:

1. **Base Styles**: Global styles in `src/app/globals.css`
2. **Component Variants**: Using class-variance-authority for component variants
3. **Custom Animations**: Defined in the TailwindCSS configuration
4. **Theme Colors**: Custom color palette with cyberpunk-inspired design
5. **Utility Classes**: Custom utilities for glassmorphism, gradients, and glowing effects

## Data Flow

1. **User Input**: Captured through UI components
2. **State Updates**: Processed through Zustand store actions
3. **API Integration**: Mock services with clean interfaces for future backend integration
4. **Challenge Generation**: Neural network generates personalized challenges based on user traits
5. **Response Evaluation**: User responses evaluated against AI approaches
6. **Badge Processing**: Achievement system tracks progress and unlocks badges
7. **Profile Generation**: Human Edge Profile created from game results
8. **Leaderboard Updates**: User scores added to leaderboard rankings
9. **Results Sharing**: Generated profiles can be shared via social media

## Authentication System

The application implements a low-friction authentication approach:

1. **Initial User Identification**: Basic user information (name, email) collected in context form
2. **Optional Google Sign-in**: Available on context page and results page
3. **Magic Link Authentication**: For returning users to access their saved progress
4. **Session Management**: Secure session handling with proper state persistence
5. **Protected Routes**: Certain routes (dashboard, leaderboard) require authentication
6. **Anonymous Play**: Core game experience available without mandatory authentication

## Performance Optimizations

1. **Component Memoization**: React.memo for expensive components
2. **State Selectors**: Zustand selectors to prevent unnecessary re-renders
3. **Code Splitting**: Next.js automatic code splitting by routes
4. **Image Optimization**: Next.js image optimization
5. **Transition Effects**: Smooth transitions between game phases

## Accessibility

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **ARIA Attributes**: Proper ARIA roles and attributes
3. **Focus Management**: Proper focus handling during navigation
4. **Color Contrast**: Sufficient contrast ratios for text
5. **Responsive Design**: Mobile-friendly layout

## Integration Points for Backend

The application is designed with clean separation between frontend and backend:

1. **API Client**: Centralized API client in `src/services/api/apiClient.ts`
2. **Mock Services**: Frontend mock implementations that match expected backend responses
3. **Authentication Hooks**: NextAuth.js integration ready for backend authentication
4. **Data Fetching**: TanStack Query setup for efficient data fetching and caching
5. **Error Handling**: Robust error boundaries and fallback UI for API failures
