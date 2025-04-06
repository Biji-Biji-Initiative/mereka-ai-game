'use client';

import React from 'react';
import { useLog } from '@/providers/LogProvider';
import { useToast } from '@/providers/ToastProvider';

/**
 * Test component for verifying provider functionality
 * 
 * This component tests the various providers and hooks
 * to ensure they're working correctly.
 */
export function TestProviders() {
  const { addLog, logs, clearLogs, isEnabled, setIsEnabled } = useLog();
  const { showToast } = useToast();
  const [count, setCount] = React.useState(0);
  
  // Test logging
  const handleTestLogging = () => {
    addLog('debug', 'Debug message test', { timestamp: new Date() });
    addLog('info', 'Info message test', { count });
    addLog('warn', 'Warning message test');
    addLog('error', 'Error message test', new Error('Test error'));
    
    setCount(prev => prev + 1);
  };
  
  // Test toast notifications
  const handleTestToast = (type: 'default' | 'success' | 'error' | 'warning' | 'info') => {
    showToast(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      `This is a ${type} toast notification test`,
      type,
      3000
    );
  };
  
  return (
    <div className="p-6 space-y-8">
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Provider Test Panel</h2>
        
        <div className="space-y-6">
          {/* Logging Test */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Logging Provider</h3>
            <div className="flex items-center space-x-2">
              <span>Status:</span>
              <span className={`font-medium ${isEnabled ? 'text-green-500' : 'text-red-500'}`}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className="ml-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
              >
                {isEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Log Count:</span>
              <span className="font-medium">{logs.length}</span>
              {logs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="ml-2 px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md"
                >
                  Clear Logs
                </button>
              )}
            </div>
            
            <button
              onClick={handleTestLogging}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Test Logging ({count})
            </button>
          </div>
          
          {/* Toast Test */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Toast Provider</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTestToast('default')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Default Toast
              </button>
              <button
                onClick={() => handleTestToast('success')}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Success Toast
              </button>
              <button
                onClick={() => handleTestToast('error')}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Error Toast
              </button>
              <button
                onClick={() => handleTestToast('warning')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md"
              >
                Warning Toast
              </button>
              <button
                onClick={() => handleTestToast('info')}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Info Toast
              </button>
            </div>
          </div>
          
          {/* Theme Test */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Theme Provider</h3>
            <p className="text-muted-foreground">
              Current theme is applied to this page. Check the DebugPanel for theme information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
