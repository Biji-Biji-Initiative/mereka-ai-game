'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define log entry structure
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

// Define context interface
interface LogContextType {
  logs: LogEntry[];
  addLog: (level: LogLevel, message: string, data?: any) => void;
  clearLogs: () => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

// Create context with default values
const LogContext = createContext<LogContextType>({
  logs: [],
  addLog: () => {},
  clearLogs: () => {},
  isEnabled: false,
  setIsEnabled: () => {},
});

// Hook for using the log context
export const useLog = () => useContext(LogContext);

// Provider component
export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(
    process.env.NEXT_PUBLIC_FEATURE_LOGGING === 'true'
  );

  // Generate a unique ID for each log entry
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Add a new log entry
  const addLog = (level: LogLevel, message: string, data?: any) => {
    if (!isEnabled) return;

    const newLog: LogEntry = {
      id: generateId(),
      timestamp: new Date(),
      level,
      message,
      data,
    };

    setLogs((prevLogs) => [...prevLogs, newLog]);

    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod as keyof Console](message, data || '');
    }
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Provide context value
  const contextValue: LogContextType = {
    logs,
    addLog,
    clearLogs,
    isEnabled,
    setIsEnabled,
  };

  return (
    <LogContext.Provider value={contextValue}>
      {children}
    </LogContext.Provider>
  );
}

export default LogProvider;
