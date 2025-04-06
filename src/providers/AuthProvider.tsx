'use client';

import React, { createContext, useContext, useState } from 'react';
import { Session } from 'next-auth';

// Define auth context interface
interface AuthContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  setSession: (session: Session | null) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  status: 'loading',
  setSession: () => {},
});

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // Update status when session changes
  React.useEffect(() => {
    setStatus(session ? 'authenticated' : 'unauthenticated');
  }, [session]);

  // Provide context value
  const contextValue: AuthContextType = {
    session,
    status,
    setSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
