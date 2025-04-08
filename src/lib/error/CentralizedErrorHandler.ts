'use client';

import React from 'react';
import { ErrorLogger } from './ErrorLogger';
import { useErrorContext } from './ErrorProvider';

/**
 * Centralized error handler for the application
 * Provides consistent error handling across components
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorContext: ReturnType<typeof useErrorContext> | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of ErrorHandler
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Set the error context from a component
   * This should be called from a component that has access to the ErrorContext
   */
  public setErrorContext(context: ReturnType<typeof useErrorContext>): void {
    this.errorContext = context;
  }

  /**
   * Handle an error with consistent logging and user notification
   */
  public handleError(error: unknown, context: Record<string, any> = {}): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Log the error
    ErrorLogger.logError(errorObj, context);
    
    // Notify the user if error context is available
    if (this.errorContext) {
      this.errorContext.addError(
        'Application Error',
        errorObj.message || 'An unexpected error occurred'
      );
    }
    
    // In production, you might want to send the error to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToMonitoringService(errorObj, context);
    }
  }

  /**
   * Handle a warning with consistent logging and optional user notification
   */
  public handleWarning(message: string, context: Record<string, any> = {}, notifyUser: boolean = false): void {
    // Log the warning
    ErrorLogger.logWarning(message, context);
    
    // Optionally notify the user
    if (notifyUser && this.errorContext) {
      this.errorContext.addError('Warning', message);
    }
  }

  /**
   * Handle informational messages with consistent logging
   */
  public handleInfo(message: string, context: Record<string, any> = {}): void {
    ErrorLogger.logInfo(message, context);
  }
}

/**
 * Hook to use the centralized error handler in components
 */
export function useCentralizedErrorHandler(componentName: string = 'UnnamedComponent') {
  const errorContext = useErrorContext();
  const errorHandler = ErrorHandler.getInstance();
  
  // Set the error context in the error handler
  React.useEffect(() => {
    errorHandler.setErrorContext(errorContext);
  }, [errorContext]);
  
  return {
    handleError: (error: unknown, additionalContext: Record<string, any> = {}) => {
      errorHandler.handleError(error, { componentName, ...additionalContext });
    },
    handleWarning: (message: string, additionalContext: Record<string, any> = {}, notifyUser: boolean = false) => {
      errorHandler.handleWarning(message, { componentName, ...additionalContext }, notifyUser);
    },
    handleInfo: (message: string, additionalContext: Record<string, any> = {}) => {
      errorHandler.handleInfo(message, { componentName, ...additionalContext });
    }
  };
}

export default { ErrorHandler, useCentralizedErrorHandler };
