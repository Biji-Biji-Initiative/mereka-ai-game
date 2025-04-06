'use client';

import React from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import CustomErrorBoundary from "@/components/ui/custom-error-boundary";
import { QueryProvider } from "@/providers/QueryProvider";
import { ApiProvider } from "@/contexts/api-context";
import AccessibilityProvider from "@/providers/AccessibilityProvider";
import SessionProvider from "@/providers/SessionProvider";
import DOMClassApplier from "@/features/ui/DOMClassApplier";
import { Toaster } from "@/components/ui/toaster";
import { LogProvider } from '@/lib/logging/log-provider';
import { GameStateLogger } from '@/components/game/GameStateLogger';
import { LogDebugger } from '@/components/dev/LogDebugger';
import GamePhaseNavigator from '@/components/game/GamePhaseNavigator';

interface ClientWrapperProps {
  children: React.ReactNode;
}

/**
 * ClientWrapper component
 * 
 * This component wraps all client-side functionality to ensure layout.tsx stays
 * a server component (which is required for metadata).
 * 
 * Follows React best practices with proper provider nesting order
 */
export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <CustomErrorBoundary>
      <LogProvider>
        <DOMClassApplier>
          <SessionProvider>
            <ApiProvider>
              <QueryProvider>
                <AccessibilityProvider>
                  <AppLayout>
                    <GameStateLogger />
                    <GamePhaseNavigator />
                    {children}
                    <Toaster />
                    {process.env.NODE_ENV === 'development' && (
                      <LogDebugger position="bottom-right" initiallyOpen={false} />
                    )}
                  </AppLayout>
                </AccessibilityProvider>
              </QueryProvider>
            </ApiProvider>
          </SessionProvider>
        </DOMClassApplier>
      </LogProvider>
    </CustomErrorBoundary>
  );
}
