'use client';

import React from 'react';
import { ErrorLogger } from '@/lib/error/ErrorLogger';

/**
 * withErrorHandling higher-order component
 * Wraps a component with try-catch error handling
 * Provides consistent error handling for functional components
 */
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = 'UnnamedComponent'
): React.FC<P> {
  const WithErrorHandling: React.FC<P> = (props) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      // Log the error
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        { componentName, props }
      );
      
      // Return a minimal fallback UI
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Component Error: {componentName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      );
    }
  };
  
  // Set display name for debugging
  WithErrorHandling.displayName = `withErrorHandling(${componentName})`;
  
  return WithErrorHandling;
}

/**
 * useErrorHandler hook
 * Provides a consistent way to handle errors in functional components
 */
export function useErrorHandler(componentName: string = 'UnnamedComponent') {
  return {
    handleError: (error: unknown, context: Record<string, any> = {}) => {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        { componentName, ...context }
      );
    },
    handleWarning: (message: string, context: Record<string, any> = {}) => {
      ErrorLogger.logWarning(message, { componentName, ...context });
    },
    handleInfo: (message: string, context: Record<string, any> = {}) => {
      ErrorLogger.logInfo(message, { componentName, ...context });
    }
  };
}

export default { withErrorHandling, useErrorHandler };
