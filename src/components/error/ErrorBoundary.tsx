'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnChange?: any[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 * 
 * Following Next.js 15 best practices for error handling.
 */
class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset the error state if resetOnChange props have changed
    if (
      this.state.hasError &&
      this.props.resetOnChange &&
      prevProps.resetOnChange &&
      this.props.resetOnChange.some((value, index) => value !== prevProps.resetOnChange?.[index])
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise render default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <DefaultErrorFallback error={this.state.error} />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error }: { error: Error | null }) {
  const router = useRouter();
  
  const handleTryAgain = () => {
    window.location.reload();
  };
  
  const handleGoHome = () => {
    router.push('/');
  };
  
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-[200px]">
            <code className="text-sm whitespace-pre-wrap break-words">
              {error?.message || 'An unexpected error occurred'}
            </code>
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Please try again or contact support if the problem persists.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoHome}>
            Go Home
          </Button>
          <Button onClick={handleTryAgain}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Export a hook-compatible wrapper for the ErrorBoundary
export default function ErrorBoundary({ children, ...props }: Props) {
  return <ErrorBoundaryClass {...props}>{children}</ErrorBoundaryClass>;
}
