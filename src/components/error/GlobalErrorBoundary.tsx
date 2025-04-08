'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

/**
 * GlobalErrorFallback component
 * Provides a consistent fallback UI for global errors
 */
function GlobalErrorFallback({ error }: { error: Error | null }) {
  const router = useRouter();
  const resetGame = useGameStore(state => state.resetGame);
  
  const handleReset = () => {
    // Attempt to reset the game state
    try {
      resetGame();
      console.log('Game state reset successfully');
    } catch (resetError) {
      console.error('Failed to reset game state:', resetError);
    }
    
    // Navigate to home page
    router.push('/');
  };
  
  const handleTryAgain = () => {
    // Reload the current page
    window.location.reload();
  };
  
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg border-red-200 dark:border-red-900">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">
            Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-32">
            {error?.message || 'An unexpected error occurred'}
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            We apologize for the inconvenience. You can try again or reset the game to start fresh.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleReset}
          >
            Reset Game
          </Button>
          <Button 
            onClick={handleTryAgain}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * GlobalErrorBoundary component
 * A wrapper around ErrorBoundary with global error handling capabilities
 * This should be used at the top level of the application
 */
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  const handleError = (error: Error) => {
    // Log the error to console (in production, this would be a logging service)
    console.error('Global error caught:', error);
    
    // You could add analytics tracking here
    // analytics.trackEvent('error', { message: error.message, stack: error.stack });
  };
  
  return (
    <ErrorBoundary 
      onError={handleError}
      fallback={<GlobalErrorFallback error={null} />}
    >
      {children}
    </ErrorBoundary>
  );
}

export default GlobalErrorBoundary;
