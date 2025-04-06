'use client';

import { LogLevel } from './types';

/**
 * Logger class for structured logging
 * Follows best practices for logging in JavaScript applications
 */
export class Logger {
  private name: string;
  private enabled: boolean;
  private minLevel: LogLevel;
  private metadata: Record<string, any>;
  private logBuffer: Array<{level: LogLevel, message: string, data?: Record<string, any>}> = [];
  private bufferSize: number = 100;
  
  constructor(name: string, options = { enabled: true, minLevel: 'debug' as LogLevel, metadata: {} }) {
    this.name = name;
    this.enabled = options.enabled ?? true;
    this.minLevel = options.minLevel ?? 'debug';
    this.metadata = options.metadata ?? {};
  }
  
  /**
   * Log a debug message
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  debug(message: string, data?: Record<string, any>): void {
    this.log('debug', message, data);
  }
  
  /**
   * Log an info message
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  info(message: string, data?: Record<string, any>): void {
    this.log('info', message, data);
  }
  
  /**
   * Log a warning message
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  warn(message: string, data?: Record<string, any>): void {
    this.log('warn', message, data);
  }
  
  /**
   * Log an error message
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  error(message: string, data?: Record<string, any>): void {
    this.log('error', message, data);
  }
  
  /**
   * Log a performance measurement
   * @param label - The label for the performance measurement
   * @param durationMs - The duration in milliseconds
   * @param data - Optional data to include with the log
   */
  performance(label: string, durationMs: number, data?: Record<string, any>): void {
    this.info(`Performance: ${label} - ${durationMs}ms`, {
      ...data,
      performance: {
        label,
        durationMs,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Start a performance measurement
   * @param label - The label for the performance measurement
   * @returns A function to end the measurement and log it
   */
  startPerformanceMeasurement(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.performance(label, duration);
    };
  }
  
  /**
   * Log a user interaction
   * @param action - The user action
   * @param data - Optional data about the interaction
   */
  userInteraction(action: string, data?: Record<string, any>): void {
    this.info(`User interaction: ${action}`, {
      ...data,
      interaction: {
        action,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Log a game event
   * @param event - The game event
   * @param data - Optional data about the event
   */
  gameEvent(event: string, data?: Record<string, any>): void {
    this.info(`Game event: ${event}`, {
      ...data,
      gameEvent: {
        event,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Internal method to log a message with a specific level
   * @param level - The log level
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    if (!this.enabled) return;
    
    // Check if the log level is high enough to be logged
    const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    if (LOG_LEVEL_SEVERITY[level] < LOG_LEVEL_SEVERITY[this.minLevel]) {
      return;
    }
    
    // Add to buffer for later retrieval
    this.logBuffer.push({ level, message, data });
    if (this.logBuffer.length > this.bufferSize) {
      this.logBuffer.shift(); // Remove oldest log if buffer is full
    }
    
    const logEntry = {
      timestamp: new Date(),
      level,
      name: this.name,
      message,
      data: {
        ...this.metadata,
        ...data
      }
    };
    
    // Output to console based on level
    switch (level) {
      case 'debug':
        console.debug(`[${this.name}]`, message, logEntry.data || '');
        break;
      case 'info':
        console.info(`[${this.name}]`, message, logEntry.data || '');
        break;
      case 'warn':
        console.warn(`[${this.name}]`, message, logEntry.data || '');
        break;
      case 'error':
        console.error(`[${this.name}]`, message, logEntry.data || '');
        break;
    }
    
    // In a production environment, this could send logs to a server
    if (typeof window !== 'undefined' && window.__LOG_COLLECTOR__) {
      window.__LOG_COLLECTOR__(logEntry);
    }
  }
  
  /**
   * Enable or disable the logger
   * @param enabled - Whether the logger should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Set the minimum log level
   * @param level - The minimum log level to output
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
  
  /**
   * Add metadata to be included with all logs
   * @param metadata - The metadata to add
   */
  addMetadata(metadata: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...metadata
    };
  }
  
  /**
   * Get the log buffer
   * @returns The log buffer
   */
  getLogBuffer(): Array<{level: LogLevel, message: string, data?: Record<string, any>}> {
    return [...this.logBuffer];
  }
  
  /**
   * Clear the log buffer
   */
  clearLogBuffer(): void {
    this.logBuffer = [];
  }
}

/**
 * Create a new logger instance
 * @param name - The name of the logger
 * @param options - Options for the logger
 * @returns A new Logger instance
 */
export function createLogger(name: string, options?: { enabled?: boolean, minLevel?: LogLevel, metadata?: Record<string, any> }): Logger {
  const isLoggingEnabled = process.env.NEXT_PUBLIC_FEATURE_LOGGING !== 'false';
  const defaultOptions = {
    enabled: isLoggingEnabled,
    minLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'debug',
    metadata: {
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      sessionId: typeof window !== 'undefined' ? window.sessionStorage.getItem('sessionId') || crypto.randomUUID() : 'server'
    }
  };
  
  // Store sessionId if it doesn't exist
  if (typeof window !== 'undefined' && !window.sessionStorage.getItem('sessionId')) {
    window.sessionStorage.setItem('sessionId', defaultOptions.metadata.sessionId);
  }
  
  return new Logger(name, {
    ...defaultOptions,
    ...options
  });
}

// Add types for global window object
declare global {
  interface Window {
    __LOG_COLLECTOR__?: (logEntry: any) => void;
  }
}

export type { LogLevel } from './types';
