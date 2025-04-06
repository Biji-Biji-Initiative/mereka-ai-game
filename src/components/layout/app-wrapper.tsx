'use client';

import React from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { GameStateLogger } from "@/components/game/GameStateLogger";

/**
 * AppWrapper component
 * 
 * This component wraps the application content and includes
 * the GameStateLogger for enhanced logging and debugging.
 */
export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <GameStateLogger />
      {children}
    </AppLayout>
  );
}
