export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
}

export interface LoggerOptions {
  enabled?: boolean;
  minLevel?: LogLevel;
  metadata?: Record<string, any>;
  bufferSize?: number;
}

// Constants for log levels to determine severity order
export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Performance measurement types
export interface PerformanceMeasurement {
  label: string;
  durationMs: number;
  timestamp: number;
}

// User interaction types
export interface UserInteraction {
  action: string;
  component?: string;
  timestamp: number;
  details?: Record<string, any>;
}

// Game event types
export interface GameEvent {
  event: string;
  timestamp: number;
  details?: Record<string, any>;
}

// Error tracking types
export interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  context?: Record<string, any>;
}

// Session information
export interface SessionInfo {
  sessionId: string;
  startTime: number;
  userAgent?: string;
  screenSize?: {
    width: number;
    height: number;
  };
}

// Log filter options
export interface LogFilterOptions {
  levels?: LogLevel[];
  search?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}
