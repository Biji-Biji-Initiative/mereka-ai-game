'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '@/store';
import { GamePhase, useIsPhaseCompleted } from '@/store/useGameStore';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { EnhancedSettingsPanel } from '@/features/settings/EnhancedSettingsPanel';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts';
import { announce } from '@/components/accessibility/screen-reader-announcer';
import { useGetProgressSummary } from '@/services/api/services/progressService';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLog } from '@/lib/logging/log-provider';

/**
 * Application header component with navigation, title and settings
 */
export const AppHeader: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useGameStore(state => state.isAuthenticated);
  const userId = useGameStore(state => state.userId);
  const resetGame = useGameStore(state => state.resetGame);
  const setGamePhase = useGameStore(state => state.setGamePhase);
  const { addLog } = useLog();
  const pathname = usePathname() || '/';
  const router = useRouter();
  
  // Get progress data for authenticated users - add a stable dependency array
  const { data: progressData } = useGetProgressSummary(
    useMemo(() => userId || '', [userId]),
    useMemo(() => isAuthenticated && !!userId, [isAuthenticated, userId])
  );
  
  // Function to handle game reset
  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      addLog('info', 'Game reset requested by user', {
        timestamp: new Date()
      });
      
      // Reset game state
      resetGame();
      
      // Set the phase explicitly to welcome
      setGamePhase(GamePhase.WELCOME);
      
      // Navigate to the home page
      router.push('/');
    }
  }, [addLog, resetGame, setGamePhase, router]);
  
  // Define callback handlers for keyboard shortcuts using useCallback
  const navigateHome = useCallback(() => {
    router.push('/');
    announce.polite('Navigated to home page');
  }, [router]);
  
  const navigateDashboard = useCallback(() => {
    router.push('/dashboard');
    announce.polite('Navigated to dashboard page');
  }, [router]);
  
  const navigateChallenges = useCallback(() => {
    router.push('/challenges');
    announce.polite('Navigated to challenges page');
  }, [router]);
  
  const navigateResults = useCallback(() => {
    router.push('/results');
    announce.polite('Navigated to results page');
  }, [router]);
  
  const openSettings = useCallback(() => {
    router.push('/settings');
    announce.polite('Opened settings page');
  }, [router]);
  
  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      keys: KEYBOARD_SHORTCUTS.NAVIGATE_HOME,
      handler: navigateHome,
      preventDefault: true,
    },
    {
      keys: KEYBOARD_SHORTCUTS.NAVIGATE_DASHBOARD,
      handler: navigateDashboard,
      preventDefault: true,
    },
    {
      keys: KEYBOARD_SHORTCUTS.NAVIGATE_CHALLENGES,
      handler: navigateChallenges,
      preventDefault: true,
    },
    {
      keys: KEYBOARD_SHORTCUTS.NAVIGATE_RESULTS,
      handler: navigateResults,
      preventDefault: true,
    },
    {
      keys: KEYBOARD_SHORTCUTS.OPEN_SETTINGS,
      handler: openSettings,
      preventDefault: true,
    },
  ]);
  
  // Announce page changes for screen readers
  useEffect(() => {
    // Only run announcer logic on client after mount
    if (!isMounted) { return; }
    
    // Get the current page name from the pathname
    const pageName = pathname === '/' 
      ? 'Home' 
      : pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1);
    
    // Announce the page change
    announce.polite(`Navigated to ${pageName} page`);
  }, [pathname, isMounted]);
  
  // Effect to set mounted state on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Call hooks unconditionally
  const traitsCompleted = useIsPhaseCompleted(GamePhase.TRAITS);
  const attitudesCompleted = useIsPhaseCompleted(GamePhase.ATTITUDES);
  const focusCompleted = useIsPhaseCompleted(GamePhase.FOCUS);
  const round1Completed = useIsPhaseCompleted(GamePhase.ROUND1);
  const round2Completed = useIsPhaseCompleted(GamePhase.ROUND2);
  const round3Completed = useIsPhaseCompleted(GamePhase.ROUND3);
  const resultsCompleted = useIsPhaseCompleted(GamePhase.RESULTS);
  
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span className="font-bold">AI Fight Club</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1">
          <ul className="flex gap-4">
            <li>
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                  pathname === '/' ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                Welcome
              </Link>
            </li>
            <li>
              <Link 
                href="/context" 
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                  pathname === '/context' ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                Context
              </Link>
            </li>
            {isMounted && traitsCompleted && (
              <li>
                <Link 
                  href="/traits" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/traits' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Traits
                </Link>
              </li>
            )}
            {isMounted && attitudesCompleted && (
              <li>
                <Link 
                  href="/attitudes" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/attitudes' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  AI Attitudes
                </Link>
              </li>
            )}
            {isMounted && focusCompleted && (
              <li>
                <Link 
                  href="/focus" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/focus' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Focus
                </Link>
              </li>
            )}
            {isMounted && focusCompleted && (
              <li>
                <Link 
                  href="/challenges" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/challenges' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Challenges
                </Link>
              </li>
            )}
            {isMounted && round1Completed && (
              <li>
                <Link 
                  href="/round1" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/round1' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Round 1
                </Link>
              </li>
            )}
            {isMounted && round2Completed && (
              <li>
                <Link 
                  href="/round2" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/round2' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Round 2
                </Link>
              </li>
            )}
            {isMounted && round3Completed && (
              <li>
                <Link 
                  href="/round3" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/round3' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Round 3
                </Link>
              </li>
            )}
            {isMounted && resultsCompleted && (
              <li>
                <Link 
                  href="/results" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/results' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Results
                </Link>
              </li>
            )}
            {isMounted && resultsCompleted && (
              <li>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === '/dashboard' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Reset Game Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="text-foreground border-border hover:bg-accent"
          >
            Reset Game
          </Button>
          
          {/* User actions and preferences */}
          {isAuthenticated && progressData?.success && progressData?.data && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/profile" className="mr-2 flex gap-1 items-center">
                    <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      <span>{progressData.data.totalBadges || 0}</span>
                    </Badge>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You have earned {progressData.data.totalBadges || 0} badges</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Settings button */}
          <EnhancedSettingsPanel />
          
          {/* Profile link if authenticated */}
          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <span className="hidden sm:inline-block">Profile</span>
              </Link>
            </Button>
          )}
          
          {/* Login/Signup if not authenticated */}
          {!isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
