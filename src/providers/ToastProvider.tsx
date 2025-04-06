"use client";

import React, { createContext, useContext, useState } from 'react';
import { useToast as useToastUI } from '@/components/ui/use-toast';

// Define toast types
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

// Define toast context interface
interface ToastContextType {
  showToast: (
    title: string, 
    description?: string, 
    type?: ToastType, 
    duration?: number
  ) => void;
}

// Create context with default values
const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

// Hook for using the toast context
export const useToast = () => useContext(ToastContext);

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  // Get the toast implementation from UI
  const { toast } = useToastUI();
  
  // Function to show a toast notification
  const showToast = (
    title: string,
    description?: string,
    type: ToastType = 'default',
    duration: number = 5000
  ) => {
    // Map toast type to variant
    const variantMap = {
      default: 'default',
      success: 'success',
      error: 'destructive',
      warning: 'warning',
      info: 'info',
    };
    
    const variant = variantMap[type] as 'default' | 'destructive' | undefined;
    
    toast({
      title,
      description,
      variant,
      duration,
    });
  };

  // Provide context value
  const contextValue: ToastContextType = {
    showToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
