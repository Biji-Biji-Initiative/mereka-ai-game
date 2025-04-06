# Neural Network Progression System Documentation

## Overview
The Neural Network Progression System provides a visual representation of the user's cognitive development over time. It represents different cognitive abilities as nodes in a network that grow and evolve based on challenge performance, creating a personalized growth map for each user.

## Key Components

### 1. Cognitive Domains
- **Memory**: Ability to retain and recall information
- **Creativity**: Ability to generate novel ideas and solutions
- **Logic**: Ability to reason systematically and draw conclusions
- **Pattern Recognition**: Ability to identify relationships in complex data
- **Processing Speed**: Ability to quickly process information and respond

### 2. Network Structure
- **Nodes**: Represent specific cognitive abilities within domains
- **Connections**: Represent relationships between cognitive abilities
- **Node Levels**: Indicate proficiency in specific abilities (1-10 scale)
- **Connection Strength**: Indicates relationship strength between abilities

### 3. Progression Mechanics
- **Node Unlocking**: New nodes unlock as base abilities develop
- **Level Progression**: Nodes level up based on performance in related challenges
- **Connection Activation**: Connections strengthen as connected nodes level up
- **Network Density**: Overall network becomes more interconnected over time

## Technical Implementation

### Data Structure
```typescript
interface NetworkNode {
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

interface NeuralNetwork {
  userId: string;
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  overallLevel: number;
  lastUpdated: string;
}
```

### State Management
The network system uses Zustand for state management with the following key functions:
- `initializeNetwork`: Creates initial network structure for a user
- `updateNetworkFromGame`: Updates network based on game performance
- `selectNode`: Selects a node for detailed viewing
- `setVisualizationMode`: Changes the visualization display mode

### Network Visualization
The network is visualized using D3.js with:
- Force-directed layout for natural node positioning
- Color coding by domain or level
- Interactive node selection for details
- Progress rings showing advancement toward next level
- Connection thickness indicating relationship strength

### Integration Points
- **Round Completion**: Network is updated based on performance
- **Results Page**: Network progress is summarized
- **Profile Page**: Full network visualization is available
- **Game Integration**: Network updates occur automatically

## User Experience Flow
1. User starts with basic nodes in each cognitive domain
2. As user completes challenges, nodes gain experience and level up
3. At certain thresholds, new nodes unlock in the network
4. Connections between nodes strengthen based on node levels
5. User can explore their network on the profile page
6. Different visualization modes provide different insights
7. Network statistics show strengths and areas for improvement

## Mock API Endpoints
- `getNeuralNetwork`: Gets a user's neural network
- `updateNeuralNetwork`: Updates network based on game results
- `getNetworkStats`: Gets statistics about the network

## UI Components
- `NetworkVisualization`: Interactive D3.js visualization of the network
- `NetworkStatsDisplay`: Shows statistics and insights about the network

## Node Types
1. **Base Nodes**: Available from the start, represent fundamental abilities
2. **Advanced Nodes**: Unlock when base nodes reach level 3, represent specialized abilities
3. **Expert Nodes**: Unlock when multiple advanced nodes are developed, represent integrated abilities
