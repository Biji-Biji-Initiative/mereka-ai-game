'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { createLogger, Logger, LogLevel } from './logger-core';
import { LogEntry, LogFilterOptions, SessionInfo } from './types';

// Context for providing logging functionality throughout the application
export interface LogContextType {
  logs: LogEntry[];
  addLog: (level: LogLevel, message: string, data?: Record<string, any>) => void;
  clearLogs: () => void;
  logger: Logger;
  filterLogs: (options: LogFilterOptions) => LogEntry[];
  sessionInfo: SessionInfo;
  exportLogs: (format?: 'json' | 'csv') => string;
}

const defaultLogContext: LogContextType = {
  logs: [],
  addLog: () => {},
  clearLogs: () => {},
  logger: createLogger('default'),
  filterLogs: () => [],
  sessionInfo: {
    sessionId: '',
    startTime: Date.now()
  },
  exportLogs: () => ''
};

const LogContext = createContext<LogContextType>(defaultLogContext);

interface LogProviderProps {
  children: React.ReactNode;
  initialLogs?: LogEntry[];
  loggerName?: string;
  maxLogs?: number;
}

/**
 * LogProvider component
 * 
 * Provides logging functionality throughout the application
 * Follows React best practices with proper context management
 * Implements comprehensive logging for tracing issues
 */
export function LogProvider({ 
  children, 
  initialLogs = [], 
  loggerName = 'app',
  maxLogs = 1000
}: LogProviderProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const logger = useMemo(() => createLogger(loggerName), [loggerName]);
  
  // Create session info
  const sessionInfo = useMemo<SessionInfo>(() => {
    const sessionId = typeof window !== 'undefined' 
      ? window.sessionStorage.getItem('sessionId') || crypto.randomUUID() 
      : crypto.randomUUID();
    
    // Store sessionId if it doesn't exist
    if (typeof window !== 'undefined' && !window.sessionStorage.getItem('sessionId')) {
      window.sessionStorage.setItem('sessionId', sessionId);
    }
    
    return {
      sessionId,
      startTime: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      screenSize: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : undefined
    };
  }, []);
  
  // Add log entry to state and output to console
  const addLog = useCallback((level: LogLevel, message: string, data?: Record<string, any>) => {
    // Create the log entry
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      data: {
        ...data,
        sessionId: sessionInfo.sessionId
      }
    };
    
    // Let React 18 handle batching naturally
    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      // Limit the number of logs stored in state to prevent memory issues
      return updatedLogs.length > maxLogs ? updatedLogs.slice(-maxLogs) : updatedLogs;
    });
    
    // Output to console based on level
    switch (level) {
      case 'debug':
        console.debug(`[${loggerName}]`, message, data);
        break;
      case 'info':
        console.info(`[${loggerName}]`, message, data);
        break;
      case 'warn':
        console.warn(`[${loggerName}]`, message, data);
        break;
      case 'error':
        console.error(`[${loggerName}]`, message, data);
        break;
    }
    
    // In a production environment, this could send logs to a server
    if (typeof window !== 'undefined' && window.__LOG_COLLECTOR__) {
      window.__LOG_COLLECTOR__(newLog);
    }
  }, [loggerName, maxLogs, sessionInfo.sessionId]);
  
  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  // Filter logs based on options
  const filterLogs = useCallback((options: LogFilterOptions): LogEntry[] => {
    return logs.filter(log => {
      // Filter by log level
      if (options.levels && options.levels.length > 0 && !options.levels.includes(log.level)) {
        return false;
      }
      
      // Filter by search term
      if (options.search && !log.message.toLowerCase().includes(options.search.toLowerCase())) {
        return false;
      }
      
      // Filter by time range
      if (options.startTime && log.timestamp < options.startTime) {
        return false;
      }
      
      if (options.endTime && log.timestamp > options.endTime) {
        return false;
      }
      
      return true;
    }).slice(0, options.limit || logs.length);
  }, [logs]);
  
  // Export logs to JSON or CSV
  const exportLogs = useCallback((format: 'json' | 'csv' = 'json'): string => {
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else if (format === 'csv') {
      // Create CSV header
      const header = 'timestamp,level,message,data\n';
      
      // Create CSV rows
      const rows = logs.map(log => {
        const timestamp = log.timestamp.toISOString();
        const level = log.level;
        const message = `"${log.message.replace(/"/g, '""')}"`;
        const data = `"${JSON.stringify(log.data).replace(/"/g, '""')}"`;
        
        return `${timestamp},${level},${message},${data}`;
      }).join('\n');
      
      return header + rows;
    }
    
    return '';
  }, [logs]);
  
  // Set up global error handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalOnError = window.onerror;
      
      // Using function syntax to preserve 'this' context
      window.onerror = function(message, source, lineno, colno, error) {
        addLog('error', 'Unhandled error', {
          message,
          source,
          lineno,
          colno,
          stack: error?.stack,
          timestamp: Date.now()
        });
        
        // Call original handler if it exists
        if (originalOnError) {
          return originalOnError.call(this, message, source, lineno, colno, error);
        }
        
        return false;
      };
      
      // Set up unhandled promise rejection handler
      const originalOnUnhandledRejection = window.onunhandledrejection;
      
      // Using function syntax to preserve 'this' context
      window.onunhandledrejection = function(event) {
        addLog('error', 'Unhandled promise rejection', {
          reason: event.reason,
          stack: event.reason?.stack,
          timestamp: Date.now()
        });
        
        // Call original handler if it exists
        if (originalOnUnhandledRejection) {
          return originalOnUnhandledRejection.call(this, event);
        }
      };
      
      // Log initial session info
      addLog('info', 'Session started', {
        sessionInfo,
        timestamp: Date.now()
      });
      
      return () => {
        // Restore original handlers
        window.onerror = originalOnError;
        window.onunhandledrejection = originalOnUnhandledRejection;
        
        // Log session end
        addLog('info', 'Session ended', {
          sessionId: sessionInfo.sessionId,
          duration: Date.now() - sessionInfo.startTime,
          timestamp: Date.now()
        });
      };
    }
  }, [addLog, sessionInfo]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    logs,
    addLog,
    clearLogs,
    logger,
    filterLogs,
    sessionInfo,
    exportLogs
  }), [logs, addLog, clearLogs, logger, filterLogs, sessionInfo, exportLogs]);
  
  return (
    <LogContext.Provider value={contextValue}>
      {children}
    </LogContext.Provider>
  );
}

/**
 * Custom hook for accessing logging functionality
 * 
 * @returns LogContextType with logs, addLog, clearLogs, and logger
 */
export function useLog(): LogContextType {
  const context = useContext(LogContext);
  
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  
  return context;
}

// Add types for global window object
declare global {
  interface Window {
    __LOG_COLLECTOR__?: (logEntry: any) => void;
    onerror: ((this: Window, ev: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => any) | null;
    onunhandledrejection: ((this: Window, ev: PromiseRejectionEvent) => any) | null;
  }
}
