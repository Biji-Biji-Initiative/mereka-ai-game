'use client';

import React, { useState } from 'react';
import { useLog } from '@/lib/logging/log-provider';
import { LogEntry, LogFilterOptions, LogLevel } from '@/lib/logging/types';

interface LogDebuggerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  initiallyOpen?: boolean;
  maxHeight?: string;
  width?: string;
}

/**
 * LogDebugger component
 * 
 * A floating debugger panel that displays logs in real-time
 * Useful for development and debugging
 */
export function LogDebugger({
  position = 'bottom-right',
  initiallyOpen = false,
  maxHeight = '400px',
  width = '500px'
}: LogDebuggerProps) {
  const { logs, clearLogs, filterLogs, exportLogs } = useLog();
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [filter, setFilter] = useState<LogFilterOptions>({
    levels: ['info', 'warn', 'error'],
    search: '',
    limit: 100
  });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [copiedLogIndex, setCopiedLogIndex] = useState<number | null>(null);
  
  // Position styles
  const positionStyles: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };
  
  // Log level colors
  const levelColors: Record<LogLevel, string> = {
    debug: 'text-gray-500',
    info: 'text-blue-500',
    warn: 'text-yellow-500',
    error: 'text-red-500'
  };
  
  // Toggle debugger visibility
  const toggleDebugger = () => {
    setIsOpen(prev => !prev);
  };
  
  // Handle level filter change
  const handleLevelChange = (level: LogLevel) => {
    setFilter(prev => {
      const levels = prev.levels || [];
      if (levels.includes(level)) {
        return { ...prev, levels: levels.filter(l => l !== level) };
      } else {
        return { ...prev, levels: [...levels, level] };
      }
    });
  };
  
  // Handle search filter change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
  };
  
  // Handle export
  const handleExport = (format: 'json' | 'csv') => {
    const content = exportLogs(format);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Copy to clipboard functionality
  const copyToClipboard = (text: string, index: number | null = null) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess('Copied!');
        setCopiedLogIndex(index);
        setTimeout(() => {
          setCopySuccess(null);
          setCopiedLogIndex(null);
        }, 2000);
      })
      .catch(() => {
        setCopySuccess('Failed to copy');
        setTimeout(() => {
          setCopySuccess(null);
        }, 2000);
      });
  };
  
  // Copy all logs
  const copyAllLogs = () => {
    const logText = filteredLogs.map(log => 
      `${formatTime(log.timestamp)}: ${log.level.toUpperCase()} - ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n');
    copyToClipboard(logText);
  };
  
  // Filter logs based on current filter
  const filteredLogs = filterLogs(filter);
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };
  
  return (
    <div className={`fixed z-50 ${positionStyles[position]}`}>
      {/* Toggle button */}
      <button
        onClick={toggleDebugger}
        className="bg-card/80 backdrop-blur-sm text-card-foreground p-2 rounded-md shadow-glow-primary border border-primary/30 hover:shadow-glow-accent transition-all duration-300"
        aria-label={isOpen ? 'Close debugger' : 'Open debugger'}
      >
        {isOpen ? '🔽 Hide Logs' : '🔼 Show Logs'}
      </button>
      
      {/* Debugger panel */}
      {isOpen && (
        <div 
          className="mt-2 bg-card/80 backdrop-blur-sm border border-primary/30 rounded-md shadow-glow-primary overflow-hidden flex flex-col"
          style={{ width, maxHeight }}
        >
          {/* Header */}
          <div className="p-2 border-b border-primary/30 flex justify-between items-center bg-background/50">
            <h3 className="font-semibold text-sm">Log Debugger</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => clearLogs()}
                className="text-xs bg-destructive/20 hover:bg-destructive/40 text-destructive-foreground px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => handleExport('json')}
                className="text-xs bg-primary/20 hover:bg-primary/40 text-primary-foreground px-2 py-1 rounded transition-colors"
              >
                Export JSON
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="text-xs bg-primary/20 hover:bg-primary/40 text-primary-foreground px-2 py-1 rounded transition-colors"
              >
                Export CSV
              </button>
              <button 
                onClick={copyAllLogs}
                className="text-xs bg-primary/20 hover:bg-primary/40 text-primary-foreground px-2 py-1 rounded transition-colors flex items-center gap-1"
              >
                {copySuccess && copiedLogIndex === null ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span>📋</span>
                )}
                {copySuccess && copiedLogIndex === null ? copySuccess : 'Copy All'}
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="p-2 border-b border-primary/30 bg-background/30 flex flex-wrap gap-2 items-center">
            <div className="flex gap-1">
              {(['debug', 'info', 'warn', 'error'] as LogLevel[]).map(level => (
                <label key={level} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={filter.levels?.includes(level) || false}
                    onChange={() => handleLevelChange(level)}
                    className="h-3 w-3"
                  />
                  <span className={levelColors[level]}>{level}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              value={filter.search || ''}
              onChange={handleSearchChange}
              className="text-xs bg-background/50 border border-primary/20 rounded px-2 py-1 flex-grow"
            />
          </div>
          
          {/* Log list */}
          <div className="overflow-y-auto flex-grow p-2 bg-background/20 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No logs to display</div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log: LogEntry, index: number) => (
                  <div key={log.id} className="border-b border-primary/10 pb-1 last:border-0">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">{formatTime(log.timestamp)}</span>
                      <span className={`${levelColors[log.level]} uppercase font-bold`}>{log.level}</span>
                      <span className="flex-grow">{log.message}</span>
                      <button 
                        onClick={() => copyToClipboard(`${formatTime(log.timestamp)} ${log.level.toUpperCase()}: ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`, index)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                        title="Copy log entry"
                      >
                        {copySuccess && copiedLogIndex === index ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span>📋</span>
                        )}
                      </button>
                    </div>
                    {log.data && (
                      <div className="ml-20 mt-1 text-muted-foreground">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-primary/30 bg-background/50 text-xs text-muted-foreground flex justify-between">
            <span>Total logs: {logs.length}</span>
            <span>Showing: {filteredLogs.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
