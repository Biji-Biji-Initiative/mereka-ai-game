import React from 'react';
import { Badge, BadgeCategory, BadgeTier } from '@/types/badge';
import { BadgeItem } from './BadgeItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface BadgeCollectionProps {
  unlockedBadges: Badge[];
  inProgressBadges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeCollection({ 
  unlockedBadges, 
  inProgressBadges,
  onBadgeClick
}: BadgeCollectionProps) {
  // Categories for filtering
  const categories: BadgeCategory[] = [
    'cognitive', 
    'creative', 
    'analytical', 
    'social', 
    'achievement', 
    'mastery'
  ];
  
  // Tiers for sorting
  const tierOrder: Record<BadgeTier, number> = {
    'platinum': 0,
    'gold': 1,
    'silver': 2,
    'bronze': 3
  };
  
  // Sort badges by tier (highest first)
  const sortByTier = (a: Badge, b: Badge) => {
    return tierOrder[a.tier] - tierOrder[b.tier];
  };
  
  // Handle badge click
  const handleBadgeClick = (badge: Badge) => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };
  
  return (
    <div className="badge-collection">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* All badges tab */}
        <TabsContent value="all">
          <div className="space-y-6">
            {unlockedBadges.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3 neon-text">Unlocked Badges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...unlockedBadges].sort(sortByTier).map(badge => (
                    <BadgeItem 
                      key={badge.id} 
                      badge={badge} 
                      unlocked={true}
                      showProgress={false}
                      onClick={() => handleBadgeClick(badge)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {inProgressBadges.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3 neon-text">Badges In Progress</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...inProgressBadges]
                    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                    .map(badge => (
                      <BadgeItem 
                        key={badge.id} 
                        badge={badge} 
                        unlocked={false}
                        showProgress={true}
                        onClick={() => handleBadgeClick(badge)}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {unlockedBadges.length === 0 && inProgressBadges.length === 0 && (
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <p>No badges available yet. Complete challenges to earn badges!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Category tabs */}
        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="space-y-6">
              {unlockedBadges.filter(b => b.category === category).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 neon-text capitalize">{category} Badges Unlocked</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...unlockedBadges]
                      .filter(b => b.category === category)
                      .sort(sortByTier)
                      .map(badge => (
                        <BadgeItem 
                          key={badge.id} 
                          badge={badge} 
                          unlocked={true}
                          showProgress={false}
                          onClick={() => handleBadgeClick(badge)}
                        />
                      ))}
                  </div>
                </div>
              )}
              
              {inProgressBadges.filter(b => b.category === category).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 neon-text capitalize">{category} Badges In Progress</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...inProgressBadges]
                      .filter(b => b.category === category)
                      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                      .map(badge => (
                        <BadgeItem 
                          key={badge.id} 
                          badge={badge} 
                          unlocked={false}
                          showProgress={true}
                          onClick={() => handleBadgeClick(badge)}
                        />
                      ))}
                  </div>
                </div>
              )}
              
              {unlockedBadges.filter(b => b.category === category).length === 0 && 
               inProgressBadges.filter(b => b.category === category).length === 0 && (
                <Card className="glass">
                  <CardContent className="p-6 text-center">
                    <p>No {category} badges available yet. Complete related challenges to earn badges!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
