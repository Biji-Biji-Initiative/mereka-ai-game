'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';

/**
 * ErrorLogger component
 * A centralized error logging utility for the application
 * Provides consistent error logging across components
 */
export class ErrorLogger {
  static logError(error: Error, context: Record<string, any> = {}) {
    // Log to console in development
    console.error('Application error:', error, context);
    
    // In production, you would send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example of how you might log to a service
      // logToService(error, context);
    }
    
    // Track error in game state for potential recovery
    try {
      const setError = useGameStore.getState().setError;
      if (setError) {
        setError(error.message);
      }
    } catch (storeError) {
      // If we can't access the store, just log to console
      console.error('Failed to log error to game store:', storeError);
    }
  }
  
  static logWarning(message: string, context: Record<string, any> = {}) {
    // Log to console in development
    console.warn('Application warning:', message, context);
    
    // In production, you would send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example of how you might log to a service
      // logWarningToService(message, context);
    }
  }
  
  static logInfo(message: string, context: Record<string, any> = {}) {
    // Log to console in development
    console.info('Application info:', message, context);
    
    // In production, you would send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example of how you might log to a service
      // logInfoToService(message, context);
    }
  }
}

export default ErrorLogger;
