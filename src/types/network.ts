/**
 * Types for the Neural Network Progression System
 */

export interface NetworkNode {
  id: string;
  name: string;
  description: string;
  level: number;  // 1-10 scale
  domain: CognitiveDomain;
  position: {
    x: number;  // 0-100 percentage for positioning
    y: number;  // 0-100 percentage for positioning
  };
  connections: string[];  // IDs of connected nodes
  unlocked: boolean;
  progress: number;  // 0-100 percentage to next level
}

export interface NetworkConnection {
  source: string;  // Node ID
  target: string;  // Node ID
  strength: number;  // 0-1 scale
  active: boolean;
}

export interface NeuralNetwork {
  userId: string;
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  overallLevel: number;
  lastUpdated: string;
}

export type CognitiveDomain = 
  | 'memory'
  | 'creativity'
  | 'logic'
  | 'pattern'
  | 'speed';

export interface NetworkStats {
  totalNodes: number;
  unlockedNodes: number;
  averageNodeLevel: number;
  dominantDomain: CognitiveDomain;
  weakestDomain: CognitiveDomain;
  totalConnections: number;
  activeConnections: number;
  networkDensity: number;  // Ratio of actual to possible connections
}

export interface NetworkProgress {
  previousLevel: number;
  currentLevel: number;
  levelProgress: number;  // 0-100 percentage to next level
  recentlyUnlockedNodes: NetworkNode[];
  recentlyActivatedConnections: NetworkConnection[];
}
