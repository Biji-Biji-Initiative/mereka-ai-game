'use client';

import React, { useState } from 'react';
import { signIn, useSession, signOut as _signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Import Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react'; // For spinner and success icon

interface SaveGameProgressProps {
  gameData: Record<string, unknown>; // Use Record<string, unknown> instead of any
  onSaveComplete?: () => void;
  onCancel?: () => void;
}

/**
 * Component for saving game progress when a user completes the game.
 * It handles both:
 * 1. For logged-in users: Directly save their progress
 * 2. For anonymous users: Prompt to login/register first
 */
export default function SaveGameProgress({ gameData, onSaveComplete, onCancel }: SaveGameProgressProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Function to save the game progress to the backend
  const saveProgress = async () => {
    if (!session?.user) {
      setShowLoginOptions(true);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Call the backend API to save game progress
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/complete_challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          challengeId: gameData.challengeId || 'default-challenge',
          score: gameData.score || 0,
          metrics: gameData.metrics || {},
          completedAt: new Date().toISOString(),
          // Add any other game data needed by your backend
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save game progress');
      }

      // Set saved flag
      setSavedSuccessfully(true);
      
      // Call completion callback if provided
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (error: unknown) {
      console.error('Error saving game progress:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while saving your progress');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for Google sign-in
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: window.location.href });
  };

  // Handler for email/password sign-in
  const handleCredentialsSignIn = () => {
    // Store current location or game state in localStorage if needed
    // localStorage.setItem('savedGameData', JSON.stringify(gameData));
    
    // Redirect to login page
    router.push('/login');
  };

  // Handler for anonymous continue
  const handleAnonymousContinue = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // If user is signed in
  if (status === 'authenticated' && !savedSuccessfully) {
    return (
      <Card className="max-w-md w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Save Your Progress</CardTitle>
          <CardDescription>
            Signed in as <span className="font-semibold">{session.user.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={saveProgress}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Progress'
            )}
          </Button>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={handleAnonymousContinue}
            disabled={isSaving}
            className="w-full"
          >
            Continue Without Saving
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If save was successful
  if (savedSuccessfully) {
    return (
      <Card className="max-w-md w-full mx-auto">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
          <CardTitle className="text-2xl">Progress Saved!</CardTitle>
          <CardDescription>
            Your game progress has been successfully saved.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={onSaveComplete}
            className="w-full"
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If user is not signed in and we need to show login options
  if (showLoginOptions) {
    return (
      <Card className="max-w-md w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Save Your Progress</CardTitle>
          <CardDescription>
            Sign in or create an account to save your progress and track your achievements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Sign in with Google
          </Button>
          <Button
            onClick={handleCredentialsSignIn}
            className="w-full"
          >
            Sign in with Email
          </Button>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <Button
            variant="secondary"
            onClick={handleAnonymousContinue}
            className="w-full"
          >
            Continue Without Saving
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your progress will be lost if you continue without saving.
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Initial state - show prompt to save
  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Game Complete!</CardTitle>
        <CardDescription>
          Congratulations on completing the game! Would you like to save your progress?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={saveProgress}
          className="w-full"
        >
          Save Progress
        </Button>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={handleAnonymousContinue}
          className="w-full"
        >
          Continue Without Saving
        </Button>
      </CardFooter>
    </Card>
  );
} 