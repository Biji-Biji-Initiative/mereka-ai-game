import React from 'react';
import { Badge } from '@/types/badge';
import { Card, CardContent } from '@/components/ui/card';

interface BadgeItemProps {
  badge: Badge;
  unlocked?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function BadgeItem({ 
  badge, 
  unlocked = false, 
  showProgress = true, 
  size = 'md',
  onClick
}: BadgeItemProps) {
  // Determine badge tier styling
  const getTierStyles = () => {
    switch (badge.tier) {
      case 'platinum':
        return 'badge-platinum';
      case 'gold':
        return 'badge-gold';
      case 'silver':
        return 'badge-silver';
      default:
        return 'badge-bronze';
    }
  };
  
  // Determine badge size styling
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'badge-small';
      case 'lg':
        return 'badge-large';
      default:
        return 'badge-medium';
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) {
       return '';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Use the correct progress object structure
  const progressPercentage = badge.progress ? badge.progress.percentage : 0;
  const isUnlocked = !!badge.unlockedAt; // Simpler check for truthiness
  const canUnlock = !isUnlocked && badge.progress && badge.progress.current >= badge.progress.target;

  let statusText = "Locked";
  let statusColor = "text-muted-foreground";
  
  if (isUnlocked && badge.unlockedAt) { // Added check for badge.unlockedAt existence for type safety
    statusText = `Unlocked on ${new Date(badge.unlockedAt).toLocaleDateString()}`;
    statusColor = "text-green-500";
  } else if (canUnlock) {
    statusText = "Ready to unlock!";
    statusColor = "text-yellow-500";
  } else if (badge.progress) {
    statusText = `Progress: ${badge.progress.current} / ${badge.progress.target}`;
  }

  const handleUnlock = () => {
    // In a real app, this might involve an API call or further validation
    if (canUnlock) { // Ensure curly braces are used
      // Assuming unlockBadge comes from props or context - keep commented for now
      // unlockBadge(badge.id); 
      console.warn("Attempted to unlock badge:", badge.id); // Placeholder
    }
  };

  return (
    <Card 
      className={`badge-item ${getTierStyles()} ${getSizeStyles()} ${isUnlocked ? 'unlocked' : 'locked'}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardContent className="p-3">
        <div className="badge-icon">
          <span>{badge.icon}</span>
          {!isUnlocked && (
            <div className="badge-lock">
              <span>🔒</span>
            </div>
          )}
        </div>
        
        <div className="badge-info">
          <h3 className="badge-name">{badge.name}</h3>
          
          {(isUnlocked || !badge.secret) && (
            <p className="badge-description">{badge.description}</p>
          )}
          
          {!isUnlocked && !badge.secret && (
            <p className="badge-requirement">{badge.requirement}</p>
          )}
          
          {isUnlocked && badge.unlockedAt && (
            <div className="badge-unlocked-date">
              Unlocked: {formatDate(badge.unlockedAt)}
            </div>
          )}
          
          {!isUnlocked && showProgress && badge.progress && progressPercentage > 0 && (
            <div className="badge-progress">
              <div className="badge-progress-bar">
                <div 
                  className="badge-progress-fill"
                  style={{ width: `${progressPercentage}%` }} // Use calculated percentage
                ></div>
              </div>
              <span className="badge-progress-text">{Math.round(progressPercentage)}%</span>
            </div>
          )}
        </div>
        
        <div className="badge-category">
          <span className={`category-${badge.category}`}>{badge.category}</span>
          <span className={`tier-${badge.tier}`}>{badge.tier}</span>
        </div>
      </CardContent>
    </Card>
  );
}
