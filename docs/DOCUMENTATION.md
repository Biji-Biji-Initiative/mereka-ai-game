# AI Fight Club - Documentation

## Overview

AI Fight Club is an interactive web application that challenges users to test their human abilities against AI systems. The application features a multi-stage game flow that includes personality assessment, focus area selection, multiple challenge rounds, and detailed results analysis.

This documentation provides comprehensive information about the application architecture, setup instructions, and API integration points for connecting to backend services.

## Table of Contents

1. [Application Architecture](#application-architecture)
2. [Technology Stack](#technology-stack)
3. [Setup and Installation](#setup-and-installation)
4. [Game Flow](#game-flow)
5. [Component Structure](#component-structure)
6. [State Management](#state-management)
7. [API Integration Points](#api-integration-points)
8. [Styling and UI/UX](#styling-and-ui-ux)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

## Application Architecture

AI Fight Club follows a modern React application architecture using Next.js 15 App Router. The application is structured around feature-based modules with clear separation of concerns:

```
src/
├── app/             # Next.js App Router pages
├── components/      # Reusable UI components
├── features/        # Feature-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared code
├── providers/       # React context providers
├── store/           # Global state management
└── tests/           # Test files
```

The application uses a client-side rendering approach for dynamic content with server components for static parts. This hybrid approach provides optimal performance and SEO benefits.

## Technology Stack

- **Framework**: Next.js 15.2.4
- **UI Library**: React 19.1.0
- **State Management**: Zustand 5.0.3
- **Styling**: TailwindCSS 4.1.2
- **Component Library**: Shadcn UI (based on Radix UI)
- **Data Fetching**: TanStack Query 5.71.10
- **Testing**: Vitest 3.1.1 and Playwright 1.51.1
- **Node.js**: 20.x LTS (required)

## Setup and Installation

### Prerequisites

- Node.js 20.x LTS
- npm 10.x or higher

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-fight-club
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to configure your environment variables.

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3333

### Production Build

To create a production build:

```bash
npm run build
npm run start
```

## Game Flow

The application follows a structured game flow:

1. **Welcome Screen**: Introduction to the game and start button
2. **Assessment**: Personality assessment with multiple questions
3. **Focus Selection**: Choose a focus area for the challenges
4. **Round 1**: Pattern recognition challenge
5. **Round 2**: Creative thinking challenge
6. **Round 3**: Problem-solving challenge
7. **Results**: Detailed analysis of performance and AI comparison

Each stage is protected by state validation to ensure users follow the correct sequence.

## Component Structure

### Core Components

- **Welcome**: Landing page with game introduction
- **Assessment**: Personality trait assessment with rating scales
- **Focus**: Focus area selection with visual cards
- **Round**: Challenge rounds with step-by-step progression
- **Results**: Performance analysis with visualizations

### UI Components

The application uses enhanced Shadcn UI components with custom styling for a futuristic aesthetic:

- **Button**: Multiple variants including futuristic, holographic, and neon
- **Card**: Glass effect cards with border animations
- **Progress**: Animated progress indicators
- **Tabs**: Interactive tab components for multi-step processes
- **Input**: Styled input fields with validation

## State Management

The application uses Zustand for global state management with a centralized store:

```typescript
// Key state structure
interface GameState {
  traits: Trait[];
  selectedFocus: Focus | null;
  roundResults: {
    round1: RoundResult | null;
    round2: RoundResult | null;
    round3: RoundResult | null;
  };
  // Actions
  setTraits: (traits: Trait[]) => void;
  setSelectedFocus: (focus: Focus) => void;
  setRoundResult: (round: number, result: RoundResult) => void;
  resetGame: () => void;
}
```

State persistence is implemented using localStorage to maintain game progress between sessions.

## API Integration Points

The application is designed to easily connect with backend APIs. The following integration points are available:

### Authentication API

```typescript
// src/lib/auth.ts
export async function authenticateUser(credentials: UserCredentials) {
  // Currently using mock data
  // Replace with actual API call:
  // return await fetch('/api/auth', {
  //   method: 'POST',
  //   body: JSON.stringify(credentials)
  // }).then(res => res.json());
}
```

### Game Data API

```typescript
// src/lib/api.ts
export async function fetchChallenges() {
  // Currently using mock data
  // Replace with actual API call:
  // return await fetch('/api/challenges').then(res => res.json());
}

export async function submitResults(results: GameResults) {
  // Currently using mock data
  // Replace with actual API call:
  // return await fetch('/api/results', {
  //   method: 'POST',
  //   body: JSON.stringify(results)
  // }).then(res => res.json());
}
```

### API Configuration

API endpoints can be configured in the `.env.local` file:

```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_AUTH_URL=https://auth.example.com
```

## Styling and UI/UX

The application features a modern, futuristic design with the following key elements:

- **Color Scheme**: Dark background with neon accents and gradient highlights
- **Typography**: Clean, modern fonts with glowing text effects
- **Animations**: Subtle hover effects, transitions, and loading animations
- **Layout**: Responsive grid system that adapts to all device sizes
- **Effects**: Glassmorphism, particle effects, and pulsing borders

Custom CSS utilities are defined in `globals.css` with TailwindCSS extensions for consistent styling.

## Testing

The application includes comprehensive testing:

### Unit Tests

Unit tests for all major components using Vitest and React Testing Library:

```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:ui     # Run tests with UI
```

### Integration Tests

Integration tests for game flow, state management, and routing:

```bash
npm run test:integration
```

### End-to-End Tests

End-to-end tests for user flows, responsive design, and accessibility:

```bash
npm run e2e         # Run all e2e tests
npm run e2e:ui      # Run e2e tests with UI
```

## Deployment

The application can be deployed to various platforms:

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

### Static Export

```bash
npm run build
npm run export
```

The static files will be available in the `out` directory.

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**:
   - Ensure you're using Node.js 20.x LTS
   - Run `npm clean-install` to refresh dependencies

2. **Styling Issues**:
   - Clear browser cache
   - Ensure TailwindCSS is properly configured

3. **State Persistence Problems**:
   - Check localStorage access in your browser
   - Clear application data if state becomes corrupted

### Support

For additional support, please open an issue in the repository or contact the development team.
