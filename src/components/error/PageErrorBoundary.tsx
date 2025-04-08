'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import PageErrorFallback from '@/components/error/PageErrorFallback';

/**
 * PageErrorBoundary component
 * A wrapper around ErrorBoundary with page-specific error handling capabilities
 * This should be used at the page level for each route
 */
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const handleError = (error: Error) => {
    // Log the error to console with page context
    console.error(`Error in page ${pathname}:`, error);
    
    // You could add analytics tracking here
    // analytics.trackEvent('pageError', { page: pathname, message: error.message });
  };
  
  const handleReset = () => {
    // Reload the current page
    window.location.reload();
  };
  
  return (
    <ErrorBoundary 
      onError={handleError}
      fallback={<PageErrorFallback error={null} reset={handleReset} />}
    >
      {children}
    </ErrorBoundary>
  );
}

export default PageErrorBoundary;
