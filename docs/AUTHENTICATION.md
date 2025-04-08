# Authentication System Documentation

## Overview

This document outlines the authentication system implementation for the Mereka AI Game, focusing on a low-friction approach that collects user information through the context form and offers optional authentication at strategic points.

## Authentication Approach

The Mereka AI Game uses a user-friendly authentication approach:

1. **Initial User Identification**: Collect name and email in the context form
2. **Optional Google Sign-in**: Available on the context page and results page
3. **Magic Link Authentication**: For returning users to access their saved progress
4. **No Authentication During Gameplay**: Rounds flow without authentication prompts

This approach prioritizes user experience by reducing friction while still maintaining user identity for progress tracking.

## NextAuth Configuration

### Core Setup

The authentication system uses NextAuth.js 5.0.0-beta.25 with the following configuration:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user data to token if available
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Environment Variables

Required environment variables for authentication:

```
NEXTAUTH_URL=http://localhost:3333
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

## User Identification Flow

### Context Form Collection

The user context form collects essential user information:

```tsx
// src/features/onboarding/UserContextForm.tsx
import { useGameStore } from '@/store/useGameStore';

export const UserContextForm = () => {
  const saveUserInfo = useGameStore(state => state.saveUserInfo);
  
  const handleSubmit = (values) => {
    // Save user info to game store
    saveUserInfo({
      name: values.name,
      email: values.email,
      occupation: values.occupation,
      location: values.location,
    });
    
    // Optional: Create user in database via API
    createUserMutation.mutate({
      name: values.name,
      email: values.email,
      occupation: values.occupation,
      location: values.location,
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <div className="flex justify-between mt-6">
        <GoogleSignInButton />
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
};
```

### Google Sign-In Integration

Google OAuth provider is available at strategic points:

```tsx
// src/features/auth/GoogleSignInButton.tsx
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export const GoogleSignInButton = () => {
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={() => signIn('google', { callbackUrl: window.location.pathname })}
    >
      <GoogleIcon className="h-5 w-5" />
      Sign in with Google
    </Button>
  );
};
```

### Magic Link Authentication

For returning users, magic link authentication is implemented:

```tsx
// src/features/auth/MagicLinkForm.tsx
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export const MagicLinkForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signIn('email', { email, redirect: false });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Magic link error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium">Check your email</h3>
        <p className="mt-2 text-sm text-gray-500">
          We've sent a magic link to {email}. Click the link to sign in.
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Sending...' : 'Send Magic Link'}
      </Button>
    </form>
  );
};
```

## Session Management

### Session Provider

The application wraps the root layout with the SessionProvider to make authentication state available throughout the app:

```tsx
// src/app/layout.tsx
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Session Hooks

Custom hooks for accessing session data:

```typescript
// src/hooks/useAuth.ts
import { useSession, signIn, signOut } from 'next-auth/react';
import { useGameStore } from '@/store/useGameStore';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { userInfo, setUserInfo } = useGameStore(state => ({
    userInfo: state.userInfo,
    setUserInfo: state.setUserInfo,
  }));
  
  // Sync session user with game store if authenticated
  useEffect(() => {
    if (session?.user && session.user.email) {
      // Only update if email doesn't match (to avoid overwriting context form data)
      if (!userInfo.email || userInfo.email !== session.user.email) {
        setUserInfo({
          name: session.user.name || userInfo.name || '',
          email: session.user.email,
          image: session.user.image || '',
          // Preserve other fields if they exist
          occupation: userInfo.occupation || '',
          location: userInfo.location || '',
        });
      }
    }
  }, [session, userInfo, setUserInfo]);

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    signInWithGoogle: () => signIn('google'),
    signInWithEmail: (email: string) => signIn('email', { email }),
    signOut: () => signOut({ callbackUrl: '/' }),
  };
};
```

## Authentication UI Components

### Results Page Authentication Prompt

The results page includes an authentication prompt for users who haven't signed in:

```tsx
// src/features/results/AuthenticationPrompt.tsx
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/useGameStore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MagicLinkForm } from '@/features/auth/MagicLinkForm';

export const AuthenticationPrompt = () => {
  const { isAuthenticated, signInWithGoogle } = useAuth();
  const { userInfo } = useGameStore();
  const [showMagicLink, setShowMagicLink] = useState(false);
  
  // Don't show if already authenticated
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="mt-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-xl font-semibold mb-2">Save Your Progress</h3>
      <p className="mb-4">
        Sign in to save your results and track your progress over time.
      </p>
      
      {showMagicLink ? (
        <MagicLinkForm />
      ) : (
        <div className="space-y-3">
          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <GoogleIcon className="h-5 w-5" />
            Sign in with Google
          </Button>
          
          <Button
            onClick={() => setShowMagicLink(true)}
            variant="outline"
            className="w-full"
          >
            Sign in with Email
          </Button>
        </div>
      )}
    </div>
  );
};
```

## Integration with Game Flow

The authentication system integrates with the game flow in the following ways:

1. **Context Form**: Collects user information and offers optional Google sign-in
2. **Game Rounds**: No authentication prompts to maintain flow
3. **Results Page**: Offers authentication to save progress
4. **Returning Users**: Can use magic link or Google sign-in to access saved progress

### User Data Persistence

User data is persisted across sessions:

```typescript
// src/services/api/services/userService.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import type { User, UserInfo } from '@/types/user';

// Create or update user
export const useCreateUser = () => {
  return useMutation({
    mutationFn: (data: UserInfo) => 
      apiClient.call<User>(
        mockEndpoints.createUser,
        '/users',
        'POST',
        data
      ),
  });
};

// Get user by email
export const useGetUserByEmail = (email: string) => {
  return useQuery({
    queryKey: ['user', email],
    queryFn: () => apiClient.call<User>(
      mockEndpoints.getUserByEmail,
      `/users/email/${email}`,
      'GET'
    ),
    enabled: !!email,
  });
};
```

## Testing Authentication

The authentication system can be tested using the following approaches:

1. **Unit Tests**: Test individual authentication components and hooks
2. **Integration Tests**: Test the authentication flow from context form to results page
3. **Mock Tests**: Test components with mocked authentication state

Example test:

```typescript
// src/tests/unit/auth.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationPrompt } from '@/features/results/AuthenticationPrompt';
import { useAuth } from '@/hooks/useAuth';

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the game store
jest.mock('@/store/useGameStore', () => ({
  useGameStore: () => ({
    userInfo: {
      name: 'Test User',
      email: 'test@example.com',
    },
  }),
}));

describe('Authentication Prompt', () => {
  it('should not render when user is authenticated', () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });
    
    render(<AuthenticationPrompt />);
    
    expect(screen.queryByText('Save Your Progress')).not.toBeInTheDocument();
  });
  
  it('should render sign-in options when user is not authenticated', () => {
    // Mock unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      signInWithGoogle: jest.fn(),
    });
    
    render(<AuthenticationPrompt />);
    
    expect(screen.getByText('Save Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Email')).toBeInTheDocument();
  });
  
  it('should show magic link form when email option is clicked', async () => {
    // Mock unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      signInWithGoogle: jest.fn(),
    });
    
    render(<AuthenticationPrompt />);
    
    await userEvent.click(screen.getByText('Sign in with Email'));
    
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByText('Send Magic Link')).toBeInTheDocument();
  });
});
```

## Transitioning to Backend Integration

When integrating with a real backend:

1. Replace mock user service with real API calls
2. Implement proper user creation and retrieval
3. Set up email service for magic links
4. Configure Google OAuth with proper credentials

The authentication system is designed with a clean separation of concerns to make this transition seamless, while maintaining the low-friction approach that prioritizes user experience.
