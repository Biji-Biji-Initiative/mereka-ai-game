'use client';

import React, { useCallback } from 'react';
import { useLog } from '@/lib/logging/log-provider';
import { Logger } from '@/lib/logging/logger-core';

/**
 * Hook for logging game state changes
 * 
 * Provides automatic logging of game state changes with structured data
 * Follows React best practices for hooks
 * 
 * @param componentName - Name of the component using the logger
 * @returns Object with logger instance and helper methods
 */
export function useGameLogger(componentName: string) {
  const { addLog } = useLog();
  const logger = React.useMemo(() => new Logger(componentName), [componentName]);
  
  // Log game state change
  const logStateChange = useCallback((
    action: string, 
    prevState: any, 
    nextState: any
  ) => {
    const changes = getStateChanges(prevState, nextState);
    
    addLog('info', `Game state changed: ${action}`, {
      component: componentName,
      action,
      changes,
      timestamp: new Date()
    });
  }, [addLog, componentName]);
  
  // Log game event
  const logGameEvent = useCallback((
    eventName: string,
    eventData?: Record<string, any>
  ) => {
    addLog('info', `Game event: ${eventName}`, {
      component: componentName,
      event: eventName,
      data: eventData,
      timestamp: new Date()
    });
  }, [addLog, componentName]);
  
  // Log user interaction
  const logUserInteraction = useCallback((
    action: string,
    details?: Record<string, any>
  ) => {
    addLog('info', `User interaction: ${action}`, {
      component: componentName,
      action,
      details,
      timestamp: new Date()
    });
  }, [addLog, componentName]);
  
  // Log game progress
  const logGameProgress = useCallback((
    step: string,
    progress: number,
    details?: Record<string, any>
  ) => {
    addLog('info', `Game progress: ${step} - ${progress}%`, {
      component: componentName,
      step,
      progress,
      details,
      timestamp: new Date()
    });
  }, [addLog, componentName]);
  
  // Log error
  const logError = useCallback((
    error: Error | string,
    context?: Record<string, any>
  ) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    addLog('error', `Game error: ${errorMessage}`, {
      component: componentName,
      error: errorMessage,
      stack: errorStack,
      context,
      timestamp: new Date()
    });
  }, [addLog, componentName]);
  
  return {
    logger,
    logStateChange,
    logGameEvent,
    logUserInteraction,
    logGameProgress,
    logError
  };
}

/**
 * Helper function to get changes between two state objects
 * 
 * @param prevState - Previous state object
 * @param nextState - Next state object
 * @returns Object containing only the changed properties
 */
function getStateChanges(prevState: any, nextState: any): Record<string, { from: any, to: any }> {
  if (!prevState || !nextState) return {};
  
  const changes: Record<string, { from: any, to: any }> = {};
  
  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(prevState),
    ...Object.keys(nextState)
  ]);
  
  // Check each key for changes
  allKeys.forEach(key => {
    if (JSON.stringify(prevState[key]) !== JSON.stringify(nextState[key])) {
      changes[key] = {
        from: prevState[key],
        to: nextState[key]
      };
    }
  });
  
  return changes;
}
