'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';

/**
 * Component to update the game store with setIsAuthenticated function
 * This is needed to properly handle authentication state in the game
 */
export function setIsAuthenticated(state: any) {
  return {
    ...state,
    isAuthenticated: false,
    setIsAuthenticated: (isAuthenticated: boolean) => {
      return {
        ...state,
        isAuthenticated
      };
    }
  };
}

// Add this middleware to the useGameStore in src/store/useGameStore.ts
