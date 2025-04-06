'use client';

import React from 'react';
import { useLog } from '@/lib/logging/log-provider';
import { AppHeader } from '@/components/layout/app-header';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout component
 * 
 * Main layout component for the application
 * Follows React best practices with proper component structure
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { addLog } = useLog();
  
  // Log when the layout mounts
  React.useEffect(() => {
    addLog('debug', 'AppLayout mounted', {
      timestamp: new Date(),
      environment: process.env.NODE_ENV
    });
    
    return () => {
      addLog('debug', 'AppLayout unmounted', {
        timestamp: new Date()
      });
    };
  }, [addLog]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      
      <footer className="bg-gray-100 p-4 border-t">
        <div className="container mx-auto text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} AI Fight Club - Human Edge Competitive Analysis
        </div>
      </footer>
    </div>
  );
}
