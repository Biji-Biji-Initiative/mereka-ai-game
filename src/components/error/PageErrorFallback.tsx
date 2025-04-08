'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

/**
 * PageErrorFallback component
 * Provides a consistent fallback UI for page-level errors
 * Less severe than global errors, allows navigation to other pages
 */
export function PageErrorFallback({ 
  error, 
  reset 
}: { 
  error: Error | null;
  reset: () => void;
}) {
  const router = useRouter();
  
  const handleGoHome = () => {
    router.push('/');
  };
  
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg border-amber-200 dark:border-amber-900">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-xl font-bold text-amber-600 dark:text-amber-400">
            Page Error
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-32">
            {error?.message || 'An error occurred while loading this page'}
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            We're having trouble displaying this page. You can try again or navigate to another page.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleGoHome}
          >
            Go Home
          </Button>
          <Button 
            onClick={reset}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PageErrorFallback;
