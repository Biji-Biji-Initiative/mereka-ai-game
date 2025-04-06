'use client';

import React, { createContext, useContext, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';

// Define store context interface
interface StoreContextType {
  isInitialized: boolean;
}

// Create context with default values
const StoreContext = createContext<StoreContextType>({
  isInitialized: false,
});

// Hook for using the store context
export const useStoreContext = () => useContext(StoreContext);

// Provider component
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Access game store to ensure it's initialized
  const gameStore = useGameStore();
  
  // Set initialized state when component mounts
  React.useEffect(() => {
    if (gameStore) {
      setIsInitialized(true);
    }
  }, [gameStore]);

  // Provide context value
  const contextValue: StoreContextType = {
    isInitialized,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

export default StoreProvider;
