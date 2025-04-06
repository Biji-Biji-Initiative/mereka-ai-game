# API Integration Guide

This document provides detailed instructions for integrating the AI Fight Club frontend with your backend APIs. The frontend is designed with clear integration points to make this process straightforward.

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Data Models](#data-models)
5. [Environment Configuration](#environment-configuration)
6. [Implementation Steps](#implementation-steps)
7. [Testing Integration](#testing-integration)

## Overview

The AI Fight Club frontend currently uses mock data for all API interactions. To connect it with your real backend, you'll need to replace these mock implementations with actual API calls. The application uses React Query for data fetching, which provides caching, loading states, and error handling.

## API Endpoints

The following API endpoints should be implemented in your backend:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - User logout

### User Data

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/history` - Get user game history

### Game Data

- `GET /api/game/challenges` - Get challenge questions
- `POST /api/game/assessment` - Submit assessment results
- `POST /api/game/round/:id` - Submit round results
- `GET /api/game/leaderboard` - Get leaderboard data
- `POST /api/game/share` - Share game results

## Authentication

The application is set up to use NextAuth.js for authentication. You'll need to configure your authentication provider in:

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

And define your auth options in:

```typescript
// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    // Configure your auth providers here
    // Example:
    // CredentialsProvider({
    //   name: 'Credentials',
    //   credentials: {
    //     username: { label: "Username", type: "text" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials) {
    //     // Add your authorization logic here
    //   }
    // })
  ],
  // Add other NextAuth.js options as needed
};
```

## Data Models

The frontend expects the following data models:

### Trait

```typescript
interface Trait {
  id: string;
  name: string;
  score: number;
  description: string;
}
```

### Focus

```typescript
interface Focus {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}
```

### RoundResult

```typescript
interface RoundResult {
  completed: boolean;
  score: number;
  timeRemaining: number;
  timeExpired: boolean;
}
```

### GameResults

```typescript
interface GameResults {
  userId: string;
  traits: Trait[];
  selectedFocus: Focus;
  roundResults: {
    round1: RoundResult;
    round2: RoundResult;
    round3: RoundResult;
  };
  overallScore: number;
  profile: string;
  timestamp: string;
}
```

## Environment Configuration

Configure your API endpoints in the `.env.local` file:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your-secret-key
```

## Implementation Steps

1. **Replace API Client**:

   Update the API client in `src/lib/api.ts` to use your actual endpoints:

   ```typescript
   import axios from 'axios';

   const apiClient = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   export async function fetchChallenges() {
     const response = await apiClient.get('/api/game/challenges');
     return response.data;
   }

   export async function submitResults(results: GameResults) {
     const response = await apiClient.post('/api/game/results', results);
     return response.data;
   }

   // Add other API functions as needed
   ```

2. **Update Authentication**:

   Configure NextAuth.js to work with your authentication system in `src/lib/auth.ts`.

3. **Update React Query Hooks**:

   The application uses React Query hooks in `src/hooks/useApi.ts`. Update these to use your real API:

   ```typescript
   import { useQuery, useMutation } from '@tanstack/react-query';
   import * as api from '@/lib/api';

   export function useChallenges() {
     return useQuery({
       queryKey: ['challenges'],
       queryFn: api.fetchChallenges,
     });
   }

   export function useSubmitResults() {
     return useMutation({
       mutationFn: api.submitResults,
     });
   }

   // Add other hooks as needed
   ```

4. **Update Environment Variables**:

   Set the correct API URLs in your `.env.local` file.

## Testing Integration

To test your API integration:

1. **Mock API Testing**:

   Use the provided mock API tests to verify your implementation matches the expected behavior:

   ```bash
   npm run test:integration
   ```

2. **End-to-End Testing**:

   Update the E2E tests to use your real API endpoints:

   ```bash
   npm run e2e
   ```

3. **Manual Testing**:

   Test each game flow step manually to ensure data is being properly sent to and received from your API.

## Troubleshooting

Common integration issues:

1. **CORS Errors**: Ensure your backend has proper CORS configuration to allow requests from your frontend domain.

2. **Authentication Issues**: Verify that authentication tokens are being properly passed and validated.

3. **Data Format Mismatches**: Ensure your API returns data in the exact format expected by the frontend.

4. **Environment Variables**: Check that all environment variables are correctly set and accessible.

If you encounter issues, the application includes comprehensive logging that can help identify the source of problems. Check the browser console for detailed logs of API interactions.
