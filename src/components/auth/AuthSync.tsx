'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useGameStore } from '@/store/useGameStore';

/**
 * AuthSync component that synchronizes authentication state with game store
 * This component should be included in the layout to ensure auth state is always in sync
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const { saveUserInfo, setIsAuthenticated } = useGameStore();
  
  // Sync auth state with game store
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // User is authenticated, update game store
      setIsAuthenticated(true);
      
      // Update user info in game store if available
      if (session.user.name || session.user.email) {
        saveUserInfo({
          name: session.user.name || undefined,
          email: session.user.email || undefined,
          // Add other fields if available in the session
        });
      }
      
      console.log('Auth state synced with game store:', session.user);
    } else if (status === 'unauthenticated') {
      // User is not authenticated, update game store
      setIsAuthenticated(false);
      console.log('User is not authenticated');
    }
  }, [session, status, saveUserInfo, setIsAuthenticated]);
  
  // This component doesn't render anything
  return null;
}
