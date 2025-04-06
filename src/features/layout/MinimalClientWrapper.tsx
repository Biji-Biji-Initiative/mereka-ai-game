'use client';

import React from 'react';

interface ClientWrapperProps {
  children: React.ReactNode;
}

/**
 * Minimal ClientWrapper component
 * 
 * This is a simplified version that removes all providers to isolate rendering issues
 */
export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
