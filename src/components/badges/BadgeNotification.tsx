"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/types/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
  autoCloseDelay?: number; // in milliseconds
}

export function BadgeNotification({ 
  badge, 
  onClose,
  autoCloseDelay = 5000 
}: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-close notification after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Allow animation to complete before removing
    }, autoCloseDelay);
    
    return () => clearTimeout(timer);
  }, [autoCloseDelay, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500); // Allow animation to complete before removing
  };
  
  // Get tier-specific styles
  const getTierStyles = () => {
    switch (badge.tier) {
      case 'platinum':
        return 'badge-notification-platinum';
      case 'gold':
        return 'badge-notification-gold';
      case 'silver':
        return 'badge-notification-silver';
      default:
        return 'badge-notification-bronze';
    }
  };
  
  return (
    <div className={`badge-notification ${getTierStyles()} ${isVisible ? 'visible' : 'hidden'}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <span className="badge-notification-icon mr-2">{badge.icon}</span>
            Badge Unlocked!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start">
            <div className="badge-notification-image mr-4">
              <div className="badge-icon-large">
                <span>{badge.icon}</span>
              </div>
            </div>
            <div className="badge-notification-details">
              <h3 className="badge-name text-lg font-bold mb-1">{badge.name}</h3>
              <p className="badge-tier text-sm mb-2">
                <span className={`tier-${badge.tier}`}>{badge.tier}</span> • 
                <span className={`category-${badge.category}`}> {badge.category}</span>
              </p>
              <p className="badge-description text-sm">{badge.description}</p>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClose}
              className="badge-notification-close"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
