'use client';

import React from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { LogProvider } from '@/lib/logging/log-provider';
import { ToastProvider } from '@/providers/ToastProvider';
import { StoreProvider } from '@/providers/StoreProvider';
import { AuthProvider } from '@/providers/AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LogProvider>
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </StoreProvider>
        </AuthProvider>
      </LogProvider>
    </ThemeProvider>
  );
}
