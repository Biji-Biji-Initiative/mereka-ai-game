'use client';

import React, { useState, useEffect } from 'react';
import { useErrorHandler } from '@/lib/error/ErrorHandlers';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

/**
 * ErrorAlert component
 * A reusable alert component for displaying errors to users
 * Supports auto-closing and manual closing
 */
export function ErrorAlert({
  title,
  description,
  variant = 'destructive',
  onClose,
  autoClose = false,
  autoCloseTime = 5000
}: ErrorAlertProps) {
  const [visible, setVisible] = useState(true);
  const { handleInfo } = useErrorHandler('ErrorAlert');
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
        handleInfo('Error alert auto-closed', { title, description });
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose, title, description, handleInfo]);
  
  const handleCloseClick = () => {
    setVisible(false);
    if (onClose) onClose();
    handleInfo('Error alert manually closed', { title, description });
  };
  
  if (!visible) return null;
  
  return (
    <Alert variant={variant} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={handleCloseClick}
      >
        <X className="h-4 w-4" />
      </Button>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export default ErrorAlert;
