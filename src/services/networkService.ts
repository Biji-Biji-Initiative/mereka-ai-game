/**
 * Neural Network Progression Service
 * 
 * This service handles the creation and management of the neural network progression system.
 * It provides functions for generating network nodes, updating progress, and calculating statistics.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  NetworkNode, 
  NetworkConnection, 
  NeuralNetwork,
  CognitiveDomain,
  NetworkStats,
  NetworkProgress
} from '@/types/network';

// Base node definitions for the five cognitive domains
const BASE_NODES: Partial<NetworkNode>[] = [
  {
    name: 'Memory',
    description: 'Your ability to retain and recall information accurately',
    domain: 'memory',
    position: { x: 50, y: 20 },
    connections: ['creativity', 'pattern']
  },
  {
    name: 'Creativity',
    description: 'Your ability to generate novel ideas and solutions',
    domain: 'creativity',
    position: { x: 80, y: 40 },
    connections: ['memory', 'logic']
  },
  {
    name: 'Logic',
    description: 'Your ability to reason systematically and draw valid conclusions',
    domain: 'logic',
    position: { x: 65, y: 70 },
    connections: ['creativity', 'pattern', 'speed']
  },
  {
    name: 'Pattern Recognition',
    description: 'Your ability to identify meaningful relationships in complex data',
    domain: 'pattern',
    position: { x: 30, y: 60 },
    connections: ['memory', 'logic', 'speed']
  },
  {
    name: 'Processing Speed',
    description: 'Your ability to quickly process information and respond appropriately',
    domain: 'speed',
    position: { x: 20, y: 35 },
    connections: ['pattern', 'logic']
  }
];

// Advanced node definitions that unlock as the network grows
const ADVANCED_NODES: Partial<NetworkNode>[] = [
  {
    name: 'Working Memory',
    description: 'Your ability to manipulate information while keeping it in mind',
    domain: 'memory',
    position: { x: 40, y: 10 },
    connections: ['memory', 'speed']
  },
  {
    name: 'Long-term Memory',
    description: 'Your ability to store and retrieve information over extended periods',
    domain: 'memory',
    position: { x: 60, y: 15 },
    connections: ['memory', 'pattern']
  },
  {
    name: 'Divergent Thinking',
    description: 'Your ability to explore many possible solutions to a problem',
    domain: 'creativity',
    position: { x: 90, y: 30 },
    connections: ['creativity', 'pattern']
  },
  {
    name: 'Convergent Thinking',
    description: 'Your ability to find the single best solution to a well-defined problem',
    domain: 'creativity',
    position: { x: 85, y: 50 },
    connections: ['creativity', 'logic']
  },
  {
    name: 'Deductive Reasoning',
    description: 'Your ability to apply general rules to specific situations',
    domain: 'logic',
    position: { x: 75, y: 80 },
    connections: ['logic', 'pattern']
  },
  {
    name: 'Inductive Reasoning',
    description: 'Your ability to derive general principles from specific observations',
    domain: 'logic',
    position: { x: 55, y: 75 },
    connections: ['logic', 'creativity']
  },
  {
    name: 'Visual Pattern Recognition',
    description: 'Your ability to identify patterns in visual information',
    domain: 'pattern',
    position: { x: 20, y: 70 },
    connections: ['pattern', 'creativity']
  },
  {
    name: 'Sequential Pattern Recognition',
    description: 'Your ability to identify patterns in sequential information',
    domain: 'pattern',
    position: { x: 35, y: 50 },
    connections: ['pattern', 'logic']
  },
  {
    name: 'Reaction Time',
    description: 'Your ability to respond quickly to stimuli',
    domain: 'speed',
    position: { x: 10, y: 25 },
    connections: ['speed', 'memory']
  },
  {
    name: 'Information Processing',
    description: 'Your ability to quickly analyze and interpret complex information',
    domain: 'speed',
    position: { x: 25, y: 45 },
    connections: ['speed', 'logic']
  }
];

// Expert node definitions that unlock at high levels
const EXPERT_NODES: Partial<NetworkNode>[] = [
  {
    name: 'Cognitive Integration',
    description: 'Your ability to synthesize information across multiple domains',
    domain: 'memory',
    position: { x: 50, y: 50 },
    connections: ['memory', 'creativity', 'logic', 'pattern', 'speed']
  },
  {
    name: 'Metacognition',
    description: 'Your awareness and understanding of your own thought processes',
    domain: 'logic',
    position: { x: 45, y: 30 },
    connections: ['memory', 'logic', 'creativity']
  },
  {
    name: 'Cognitive Flexibility',
    description: 'Your ability to adapt thinking strategies to new situations',
    domain: 'creativity',
    position: { x: 70, y: 60 },
    connections: ['creativity', 'logic', 'speed']
  },
  {
    name: 'Intuitive Pattern Recognition',
    description: 'Your ability to recognize patterns without conscious reasoning',
    domain: 'pattern',
    position: { x: 30, y: 40 },
    connections: ['pattern', 'speed', 'creativity']
  },
  {
    name: 'Cognitive Efficiency',
    description: 'Your ability to allocate mental resources optimally',
    domain: 'speed',
    position: { x: 15, y: 55 },
    connections: ['speed', 'memory', 'logic']
  }
];

/**
 * Creates an initial neural network for a new user
 */
export function createInitialNetwork(userId: string): NeuralNetwork {
  // Create base nodes
  const nodes: NetworkNode[] = BASE_NODES.map(baseNode => ({
    id: baseNode.domain as string,
    name: baseNode.name as string,
    description: baseNode.description as string,
    level: 1,
    domain: baseNode.domain as CognitiveDomain,
    position: baseNode.position as { x: number, y: number },
    connections: baseNode.connections as string[],
    unlocked: true,
    progress: 0
  }));
  
  // Create connections between base nodes
  const connections: NetworkConnection[] = [];
  
  nodes.forEach(node => {
    node.connections.forEach(targetId => {
      // Avoid duplicate connections
      const connectionExists = connections.some(
        conn => (conn.source === node.id && conn.target === targetId) ||
                (conn.source === targetId && conn.target === node.id)
      );
      
      if (!connectionExists) {
        connections.push({
          source: node.id,
          target: targetId,
          strength: 0.5, // Initial medium strength
          active: true
        });
      }
    });
  });
  
  // Add advanced nodes (locked initially)
  const advancedNodes: NetworkNode[] = ADVANCED_NODES.map(advNode => ({
    id: `${advNode.domain}-${uuidv4().substring(0, 8)}`,
    name: advNode.name as string,
    description: advNode.description as string,
    level: 1,
    domain: advNode.domain as CognitiveDomain,
    position: advNode.position as { x: number, y: number },
    connections: advNode.connections as string[],
    unlocked: false,
    progress: 0
  }));
  
  // Add expert nodes (locked initially)
  const expertNodes: NetworkNode[] = EXPERT_NODES.map(expNode => ({
    id: `${expNode.domain}-expert-${uuidv4().substring(0, 8)}`,
    name: expNode.name as string,
    description: expNode.description as string,
    level: 1,
    domain: expNode.domain as CognitiveDomain,
    position: expNode.position as { x: number, y: number },
    connections: expNode.connections as string[],
    unlocked: false,
    progress: 0
  }));
  
  // Combine all nodes
  const allNodes = [...nodes, ...advancedNodes, ...expertNodes];
  
  return {
    userId,
    nodes: allNodes,
    connections,
    overallLevel: 1,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Updates the neural network based on game performance
 */
export function updateNetworkFromGameResults(
  network: NeuralNetwork,
  gameState: any,
  rivalState: any
): { 
  updatedNetwork: NeuralNetwork; 
  progress: NetworkProgress;
} {
  // Track changes for progress reporting
  const previousLevel = network.overallLevel;
  const recentlyUnlockedNodes: NetworkNode[] = [];
  const recentlyActivatedConnections: NetworkConnection[] = [];
  
  // Clone the network to avoid direct mutations
  const updatedNetwork: NeuralNetwork = {
    ...network,
    nodes: [...network.nodes],
    connections: [...network.connections],
    lastUpdated: new Date().toISOString()
  };
  
  // Update nodes based on game performance
  updatedNetwork.nodes = updatedNetwork.nodes.map(node => {
    // Check if this node should be updated based on game results
    const nodeProgress = calculateNodeProgress(node, gameState, rivalState);
    
    // If node is not unlocked, check if it should be unlocked
    if (!node.unlocked) {
      const shouldUnlock = checkNodeUnlockCondition(node, updatedNetwork, gameState);
      
      if (shouldUnlock) {
        const unlockedNode = {
          ...node,
          unlocked: true,
          progress: nodeProgress
        };
        
        recentlyUnlockedNodes.push(unlockedNode);
        return unlockedNode;
      }
      
      return node;
    }
    
    // Update progress for unlocked nodes
    let updatedProgress = node.progress + nodeProgress;
    let updatedLevel = node.level;
    
    // Level up if progress reaches 100%
    if (updatedProgress >= 100) {
      updatedLevel = Math.min(10, node.level + 1);
      updatedProgress = updatedProgress - 100;
    }
    
    return {
      ...node,
      level: updatedLevel,
      progress: updatedProgress
    };
  });
  
  // Update connections based on node levels
  updatedNetwork.connections = updatedNetwork.connections.map(connection => {
    const sourceNode = updatedNetwork.nodes.find(n => n.id === connection.source);
    const targetNode = updatedNetwork.nodes.find(n => n.id === connection.target);
    
    // Only update if both nodes are unlocked
    if (sourceNode?.unlocked && targetNode?.unlocked) {
      // Calculate new strength based on node levels
      const avgLevel = (sourceNode.level + targetNode.level) / 2;
      const newStrength = Math.min(1, avgLevel / 10);
      
      // Check if connection was previously inactive but now active
      if (!connection.active && newStrength > 0.3) {
        recentlyActivatedConnections.push({
          ...connection,
          strength: newStrength,
          active: true
        });
        
        return {
          ...connection,
          strength: newStrength,
          active: true
        };
      }
      
      return {
        ...connection,
        strength: newStrength
      };
    }
    
    return connection;
  });
  
  // Calculate overall network level
  const unlockedNodes = updatedNetwork.nodes.filter(n => n.unlocked);
  const totalLevels = unlockedNodes.reduce((sum, node) => sum + node.level, 0);
  const newOverallLevel = Math.max(1, Math.floor(totalLevels / unlockedNodes.length));
  
  updatedNetwork.overallLevel = newOverallLevel;
  
  // Calculate level progress
  const levelProgress = calculateLevelProgress(updatedNetwork);
  
  // Return updated network and progress information
  return {
    updatedNetwork,
    progress: {
      previousLevel,
      currentLevel: newOverallLevel,
      levelProgress,
      recentlyUnlockedNodes,
      recentlyActivatedConnections
    }
  };
}

/**
 * Calculates progress for a specific node based on game performance
 */
function calculateNodeProgress(
  node: NetworkNode,
  gameState: any,
  rivalState: any
): number {
  // Base progress amount
  const baseProgress = 5;
  
  // Get round results
  const roundResults = gameState.roundResults || {};
  
  // Calculate domain-specific progress based on game performance
  let domainProgress = 0;
  
  switch (node.domain) {
    case 'memory':
      // Memory is primarily tested in round 1
      if (roundResults.round1?.score) {
        domainProgress = (roundResults.round1.score / 100) * 20;
      }
      break;
      
    case 'creativity':
      // Creativity is primarily tested in round 2
      if (roundResults.round2?.score) {
        domainProgress = (roundResults.round2.score / 100) * 20;
      }
      break;
      
    case 'logic':
      // Logic is tested across all rounds
      const round1Score = roundResults.round1?.score || 0;
      const round2Score = roundResults.round2?.score || 0;
      const round3Score = roundResults.round3?.score || 0;
      
      if (round1Score || round2Score || round3Score) {
        const avgScore = (round1Score + round2Score + round3Score) / 3;
        domainProgress = (avgScore / 100) * 15;
      }
      break;
      
    case 'pattern':
      // Pattern recognition is primarily tested in round 1
      if (roundResults.round1?.score) {
        domainProgress = (roundResults.round1.score / 100) * 20;
      }
      break;
      
    case 'speed':
      // Speed is measured by time remaining
      const round1Time = roundResults.round1?.timeRemaining || 0;
      const round2Time = roundResults.round2?.timeRemaining || 0;
      const round3Time = roundResults.round3?.timeRemaining || 0;
      
      if (round1Time || round2Time || round3Time) {
        // Assuming 60 seconds total time per round
        const avgTimePercentage = ((round1Time + round2Time + round3Time) / 3) / 60;
        domainProgress = avgTimePercentage * 25;
      }
      break;
  }
  
  // Bonus progress for beating rival in relevant domain
  if (rivalState?.currentRival) {
    const rivalPerformance = rivalState.currentRival.performance || {};
    
    // Check if user beat rival in relevant rounds
    if (node.domain === 'memory' || node.domain === 'pattern') {
      if (roundResults.round1?.score > rivalPerformance.round1) {
        domainProgress += 5;
      }
    }
    
    if (node.domain === 'creativity') {
      if (roundResults.round2?.score > rivalPerformance.round2) {
        domainProgress += 5;
      }
    }
    
    if (node.domain === 'logic') {
      if (roundResults.round3?.score > rivalPerformance.round3) {
        domainProgress += 5;
      }
    }
  }
  
  // Return total progress (base + domain-specific)
  return Math.min(25, baseProgress + domainProgress);
}

/**
 * Checks if a node should be unlocked based on network state and game performance
 */
function checkNodeUnlockCondition(
  node: NetworkNode,
  network: NeuralNetwork,
  gameState: any
): boolean {
  // Advanced nodes unlock when connected base nodes reach level 3
  if (ADVANCED_NODES.some(n => n.name === node.name)) {
    // Find connected base nodes
    const connectedBaseNodes = network.nodes.filter(n => 
      node.connections.includes(n.id) && 
      BASE_NODES.some(bn => bn.domain === n.domain)
    );
    
    // Check if any connected base node is at least level 3
    return connectedBaseNodes.some(n => n.level >= 3);
  }
  
  // Expert nodes unlock when at least 3 advanced nodes in the same domain are unlocked
  if (EXPERT_NODES.some(n => n.name === node.name)) {
    const unlockedAdvancedNodesInDomain = network.nodes.filter(n => 
      n.domain === node.domain && 
      n.unlocked && 
      ADVANCED_NODES.some(an => an.name === n.name)
    );
    
    return unlockedAdvancedNodesInDomain.length >= 2;
  }
  
  return false;
}

/**
 * Calculates progress towards the next overall level
 */
function calculateLevelProgress(network: NeuralNetwork): number {
  const unlockedNodes = network.nodes.filter(n => n.unlocked);
  const totalLevels = unlockedNodes.reduce((sum, node) => sum + node.level, 0);
  const avgLevel = totalLevels / unlockedNodes.length;
  
  // Calculate progress to next level (0-100%)
  const currentLevel = network.overallLevel;
  const progressToNext = (avgLevel - currentLevel) * 100;
  
  return Math.min(100, Math.max(0, progressToNext));
}

/**
 * Calculates statistics for the neural network
 */
export function calculateNetworkStats(network: NeuralNetwork): NetworkStats {
  const unlockedNodes = network.nodes.filter(n => n.unlocked);
  const activeConnections = network.connections.filter(c => c.active);
  
  // Calculate average node level
  const totalLevels = unlockedNodes.reduce((sum, node) => sum + node.level, 0);
  const averageNodeLevel = unlockedNodes.length > 0 ? totalLevels / unlockedNodes.length : 0;
  
  // Find dominant and weakest domains
  const domainLevels: Record<CognitiveDomain, { total: number, count: number }> = {
    memory: { total: 0, count: 0 },
    creativity: { total: 0, count: 0 },
    logic: { total: 0, count: 0 },
    pattern: { total: 0, count: 0 },
    speed: { total: 0, count: 0 }
  };
  
  unlockedNodes.forEach(node => {
    domainLevels[node.domain].total += node.level;
    domainLevels[node.domain].count += 1;
  });
  
  // Calculate average level for each domain
  const domainAverages: Record<CognitiveDomain, number> = {} as Record<CognitiveDomain, number>;
  
  Object.entries(domainLevels).forEach(([domain, { total, count }]) => {
    domainAverages[domain as CognitiveDomain] = count > 0 ? total / count : 0;
  });
  
  // Find dominant and weakest domains
  let dominantDomain: CognitiveDomain = 'logic';
  let weakestDomain: CognitiveDomain = 'logic';
  let highestAvg = 0;
  let lowestAvg = Infinity;
  
  Object.entries(domainAverages).forEach(([domain, avg]) => {
    if (avg > highestAvg) {
      highestAvg = avg;
      dominantDomain = domain as CognitiveDomain;
    }
    
    if (avg < lowestAvg && avg > 0) {
      lowestAvg = avg;
      weakestDomain = domain as CognitiveDomain;
    }
  });
  
  // Calculate network density
  const possibleConnections = (unlockedNodes.length * (unlockedNodes.length - 1)) / 2;
  const networkDensity = possibleConnections > 0 ? activeConnections.length / possibleConnections : 0;
  
  return {
    totalNodes: network.nodes.length,
    unlockedNodes: unlockedNodes.length,
    averageNodeLevel,
    dominantDomain,
    weakestDomain,
    totalConnections: network.connections.length,
    activeConnections: activeConnections.length,
    networkDensity
  };
}
