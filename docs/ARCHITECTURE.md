# AI Fight Club Frontend - Technical Architecture

This document provides an overview of the technical architecture of the enhanced AI Fight Club frontend application.

## Application Structure

The application follows a modern React architecture with Next.js, using the following structure:

```
frontend-manus/
├── docs/                  # Documentation files
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # Reusable UI components
│   │   ├── dev/           # Development tools
│   │   ├── game/          # Game-specific components
│   │   ├── layout/        # Layout components
│   │   ├── test/          # Testing components
│   │   └── ui/            # UI component library
│   ├── features/          # Feature modules
│   │   ├── assessment/    # Assessment feature
│   │   ├── focus/         # Focus selection feature
│   │   ├── layout/        # Layout features
│   │   ├── results/       # Results display feature
│   │   ├── rounds/        # Game rounds feature
│   │   ├── shared/        # Shared feature components
│   │   └── welcome/       # Welcome screen feature
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── logging/       # Enhanced logging system
│   │   ├── fonts.ts       # Font configuration
│   │   ├── schemas.ts     # Data validation schemas
│   │   └── utils.ts       # Utility functions
│   ├── providers/         # React context providers
│   └── store/             # State management
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

## Key Architecture Patterns

### Component Architecture

The application follows a component-based architecture with:

1. **UI Components**: Reusable, presentational components in `src/components/ui/`
2. **Feature Components**: Business logic components in `src/features/`
3. **Layout Components**: Page structure components in `src/components/layout/`
4. **Provider Components**: Context providers in `src/providers/`

### State Management

The application uses Zustand for state management with the following stores:

- **Game Store**: Manages game state, including:
  - Current game step
  - Completed steps
  - User traits from assessment
  - Selected focus area
  - Round results
  - Game progress

### Routing

The application uses Next.js App Router with the following structure:

- `/` - Welcome page
- `/assessment` - Personality assessment
- `/focus` - Focus area selection
- `/round1`, `/round2`, `/round3` - Game rounds
- `/results` - Results display

Each route is protected to ensure users follow the intended game flow.

### Logging System

The enhanced logging system includes:

1. **Logger Core**: Base logging functionality in `src/lib/logging/logger-core.ts`
2. **Log Provider**: React context provider in `src/lib/logging/log-provider.tsx`
3. **Log Types**: Type definitions in `src/lib/logging/types.ts`
4. **Log Debugger**: Visual debugging tool in `src/components/dev/LogDebugger.tsx`

### Styling Approach

The application uses a custom TailwindCSS configuration with:

1. **Base Styles**: Global styles in `src/app/globals.css`
2. **Component Variants**: Using class-variance-authority for component variants
3. **Custom Animations**: Defined in the TailwindCSS configuration
4. **Theme Colors**: Custom color palette with primary, secondary, and accent colors
5. **Utility Classes**: Custom utilities for glassmorphism, gradients, and glowing effects

## Data Flow

1. **User Input**: Captured through UI components
2. **State Updates**: Processed through Zustand store actions
3. **Component Rendering**: UI updates based on state changes
4. **Logging**: All significant events and state changes are logged
5. **Navigation**: Route changes based on game progress

## Performance Optimizations

1. **Component Memoization**: React.memo for expensive components
2. **State Selectors**: Zustand selectors to prevent unnecessary re-renders
3. **Code Splitting**: Next.js automatic code splitting by routes
4. **Image Optimization**: Next.js image optimization
5. **Transition Effects**: Smooth transitions between game stages

## Accessibility

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **ARIA Attributes**: Proper ARIA roles and attributes
3. **Focus Management**: Proper focus handling during navigation
4. **Color Contrast**: Sufficient contrast ratios for text
5. **Responsive Design**: Mobile-friendly layout
