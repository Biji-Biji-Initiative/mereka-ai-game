'use client';

import React from 'react';
import { useLog } from '@/lib/logging/log-provider';

interface DebugPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  initiallyOpen?: boolean;
}

/**
 * DebugPanel component
 * 
 * A development tool for debugging application state and environment
 * Provides information about the current environment, build, and system status
 */
export function DebugPanel({
  position = 'bottom-left',
  initiallyOpen = false
}: DebugPanelProps) {
  const { addLog } = useLog();
  const [isOpen, setIsOpen] = React.useState(initiallyOpen);
  const [systemInfo, setSystemInfo] = React.useState<Record<string, any>>({});
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Collect system information on mount
  React.useEffect(() => {
    const info = {
      nextVersion: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      nodeEnv: process.env.NODE_ENV,
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || 'development',
      browserInfo: getBrowserInfo(),
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      timestamp: new Date().toISOString(),
    };
    
    setSystemInfo(info);
    
    // Log debug panel initialization
    addLog('debug', 'Debug panel initialized', info);
    
    // Handle window resize
    const handleResize = () => {
      setSystemInfo(prev => ({
        ...prev,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [addLog]);
  
  // Position styles
  const positionStyles: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };
  
  return (
    <div className={`fixed ${positionStyles[position]} z-50`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
        aria-label={isOpen ? 'Close debug panel' : 'Open debug panel'}
      >
        {isOpen ? '✕' : '🛠️'}
      </button>
      
      {/* Debug panel */}
      {isOpen && (
        <div className="bg-gray-900 text-white rounded-lg shadow-xl mt-2 w-80 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-2 border-b border-gray-700">
            <h3 className="font-bold">Debug Panel</h3>
          </div>
          
          {/* System info */}
          <div className="overflow-y-auto flex-1 text-xs p-2">
            <h4 className="font-bold mb-2">System Information</h4>
            <ul className="space-y-1">
              {Object.entries(systemInfo).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="text-gray-400">{formatKey(key)}:</span>
                  <span>{String(value)}</span>
                </li>
              ))}
            </ul>
            
            {/* Debug actions */}
            <h4 className="font-bold mt-4 mb-2">Debug Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  addLog('info', 'Manual test log triggered from debug panel', {
                    timestamp: new Date()
                  });
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
              >
                Trigger Test Log
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  addLog('info', 'Local storage cleared from debug panel', {
                    timestamp: new Date()
                  });
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs"
              >
                Clear Local Storage
              </button>
              
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
              >
                Reload Application
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-gray-700 text-xs text-gray-500">
            AI Fight Club - Development Build
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format key for display
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Get browser information
 */
function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "";
  
  if (ua.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("SamsungBrowser") > -1) {
    browserName = "Samsung Browser";
    browserVersion = ua.match(/SamsungBrowser\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
    browserName = "Opera";
    browserVersion = ua.match(/Opera\/([0-9.]+)/)?.[1] || ua.match(/OPR\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Edg") > -1) {
    browserName = "Edge";
    browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Chrome") > -1) {
    browserName = "Chrome";
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Safari") > -1) {
    browserName = "Safari";
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || "";
  }
  
  return `${browserName} ${browserVersion}`;
}
