'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ErrorAlert } from '@/components/error/ErrorAlert';

// Define the error context type
interface ErrorContextType {
  addError: (title: string, description: string) => void;
  clearErrors: () => void;
  errors: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

// Create the error context with default values
const ErrorContext = createContext<ErrorContextType>({
  addError: () => {},
  clearErrors: () => {},
  errors: [],
});

// Custom hook to use the error context
export const useErrorContext = () => useContext(ErrorContext);

/**
 * ErrorProvider component
 * Provides a centralized way to manage and display errors across the application
 */
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<Array<{
    id: string;
    title: string;
    description: string;
  }>>([]);

  // Add a new error to the list
  const addError = (title: string, description: string) => {
    const id = Date.now().toString();
    setErrors((prevErrors) => [...prevErrors, { id, title, description }]);
  };

  // Clear all errors
  const clearErrors = () => {
    setErrors([]);
  };

  // Remove a specific error by ID
  const removeError = (id: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id));
  };

  return (
    <ErrorContext.Provider value={{ addError, clearErrors, errors }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
        {errors.map((error) => (
          <ErrorAlert
            key={error.id}
            title={error.title}
            description={error.description}
            variant="destructive"
            onClose={() => removeError(error.id)}
            autoClose={true}
          />
        ))}
      </div>
    </ErrorContext.Provider>
  );
}

export default ErrorProvider;
