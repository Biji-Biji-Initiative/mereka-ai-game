'use client';

import React from 'react';
import { useLog } from '@/lib/logging/log-provider';

interface CustomErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * CustomErrorBoundary component
 * 
 * Error boundary to catch and log React rendering errors
 * Follows React best practices for error handling
 */
class CustomErrorBoundary extends React.Component<CustomErrorBoundaryProps, ErrorState> {
  constructor(props: CustomErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to our logging system
    const logContext = this.context;
    
    // Access the logging context if available
    if (logContext && typeof logContext.addLog === 'function') {
      logContext.addLog('error', `React error boundary caught error: ${error.message}`, {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date()
      });
    }
    
    // Always log to console as fallback
    console.error('Error caught by CustomErrorBoundary:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-xl font-medium text-black">Something went wrong</h2>
          <p className="text-gray-500">
            The application encountered an error. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="w-full mt-4">
              <p className="font-bold text-red-600">Error:</p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <>
                  <p className="font-bold text-red-600 mt-2">Component Stack:</p>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a wrapper component to use hooks with class component
export default function CustomErrorBoundaryWithLogging(props: CustomErrorBoundaryProps) {
  const logContext = useLog();
  
  return (
    <LoggingContext.Provider value={logContext}>
      <CustomErrorBoundary {...props} />
    </LoggingContext.Provider>
  );
}

// Create context for passing logging functionality to class component
const LoggingContext = React.createContext<ReturnType<typeof useLog> | null>(null);
CustomErrorBoundary.contextType = LoggingContext;
