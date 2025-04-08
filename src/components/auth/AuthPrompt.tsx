'use client';

import { useEffect } from 'react';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * AuthPrompt component that shows authentication prompts at strategic points
 * Only shows on context page and results page for users who haven't signed in yet
 */
export function AuthPrompt() {
  const { data: session, status } = useSession();
  const isAuthenticated = useGameStore(state => state.isAuthenticated);
  const gamePhase = useGameStore(state => state.gamePhase);
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine if we should show auth prompt based on current page and auth status
  const shouldShowPrompt = () => {
    // Don't show if user is already authenticated
    if (isAuthenticated || status === 'authenticated') {
      return false;
    }
    
    // Only show on context page or results page
    const isContextPage = pathname === '/context';
    const isResultsPage = pathname === '/results';
    
    // On context page, only show if user has completed the context form
    if (isContextPage) {
      return gamePhase !== GamePhase.WELCOME;
    }
    
    // On results page, always show if user is not authenticated
    if (isResultsPage) {
      return true;
    }
    
    // Don't show on other pages
    return false;
  };
  
  // Handle sign in button click
  const handleSignIn = () => {
    router.push('/signin');
  };
  
  // Don't render anything if we shouldn't show the prompt
  if (!shouldShowPrompt()) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm border border-gray-200 dark:border-gray-700 z-50">
      <h3 className="font-medium text-lg mb-2">Save Your Progress</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
        Sign in to save your progress and see your results later.
      </p>
      <div className="flex justify-end">
        <button 
          onClick={() => handleSignIn()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
