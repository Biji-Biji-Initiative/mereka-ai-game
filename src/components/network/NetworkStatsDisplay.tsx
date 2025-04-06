import React from 'react';
import { NetworkStats } from '@/types/network';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NetworkStatsDisplayProps {
  stats: NetworkStats;
  className?: string;
}

export function NetworkStatsDisplay({ stats, className = '' }: NetworkStatsDisplayProps) {
  // Format domain name
  const formatDomain = (domain: string) => {
    switch (domain) {
      case 'memory':
        return 'Memory';
      case 'creativity':
        return 'Creativity';
      case 'logic':
        return 'Logic';
      case 'pattern':
        return 'Pattern Recognition';
      case 'speed':
        return 'Processing Speed';
      default:
        return domain;
    }
  };
  
  // Get domain color
  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'memory':
        return '#4a9df8'; // Blue
      case 'creativity':
        return '#f87c4a'; // Orange
      case 'logic':
        return '#4af8a7'; // Green
      case 'pattern':
        return '#c44af8'; // Purple
      case 'speed':
        return '#f8e54a'; // Yellow
      default:
        return '#88ccff'; // Default blue
    }
  };
  
  return (
    <Card className={`network-stats ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold neon-text">Neural Network Stats</CardTitle>
        <CardDescription>
          Your cognitive profile visualization
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card glass p-3 rounded-lg">
            <div className="stat-value text-2xl font-bold">{stats.unlockedNodes}</div>
            <div className="stat-label text-sm text-muted-foreground">Unlocked Nodes</div>
          </div>
          
          <div className="stat-card glass p-3 rounded-lg">
            <div className="stat-value text-2xl font-bold">{stats.averageNodeLevel.toFixed(1)}</div>
            <div className="stat-label text-sm text-muted-foreground">Average Level</div>
          </div>
          
          <div className="stat-card glass p-3 rounded-lg">
            <div className="stat-value text-2xl font-bold">{stats.activeConnections}</div>
            <div className="stat-label text-sm text-muted-foreground">Active Connections</div>
          </div>
          
          <div className="stat-card glass p-3 rounded-lg">
            <div className="stat-value text-2xl font-bold">{(stats.networkDensity * 100).toFixed(0)}%</div>
            <div className="stat-label text-sm text-muted-foreground">Network Density</div>
          </div>
        </div>
        
        <div className="domain-strengths space-y-3">
          <h3 className="text-lg font-semibold">Domain Strengths</h3>
          
          <div className="domain-card p-3 glass rounded-lg">
            <div className="flex items-center">
              <div 
                className="domain-indicator mr-3"
                style={{ backgroundColor: getDomainColor(stats.dominantDomain) }}
              ></div>
              <div>
                <div className="font-medium">Dominant Domain</div>
                <div className="text-sm">{formatDomain(stats.dominantDomain)}</div>
              </div>
            </div>
          </div>
          
          <div className="domain-card p-3 glass rounded-lg">
            <div className="flex items-center">
              <div 
                className="domain-indicator mr-3"
                style={{ backgroundColor: getDomainColor(stats.weakestDomain) }}
              ></div>
              <div>
                <div className="font-medium">Growth Opportunity</div>
                <div className="text-sm">{formatDomain(stats.weakestDomain)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="network-tips p-4 data-card rounded-lg">
          <h3 className="font-medium mb-2">Network Growth Tips</h3>
          <ul className="space-y-2 text-sm">
            <li>Complete challenges in your weaker domains to unlock new nodes</li>
            <li>Higher scores in challenges lead to faster node level progression</li>
            <li>Nodes level up when progress reaches 100%</li>
            <li>Connections strengthen as connected nodes level up</li>
            <li>Advanced nodes unlock when base nodes reach level 3</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
