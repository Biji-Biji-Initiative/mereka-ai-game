import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  NetworkNode, 
  NetworkConnection, 
  NeuralNetwork,
  NetworkStats,
  NetworkProgress
} from '@/types/network';
import { 
  createInitialNetwork,
  updateNetworkFromGameResults,
  calculateNetworkStats
} from '@/services/networkService';

interface NetworkState {
  // Current neural network
  network: NeuralNetwork | null;
  
  // Network statistics
  stats: NetworkStats | null;
  
  // Recent progress updates
  recentProgress: NetworkProgress | null;
  
  // Visualization settings
  visualizationMode: 'standard' | 'domains' | 'levels' | 'connections';
  selectedNodeId: string | null;
  
  // Actions
  initializeNetwork: (userId: string) => void;
  updateNetworkFromGame: (gameState: any, rivalState: any) => void;
  selectNode: (nodeId: string | null) => void;
  setVisualizationMode: (mode: 'standard' | 'domains' | 'levels' | 'connections') => void;
  resetNetwork: () => void;
}

// Initial state
const initialState = {
  network: null,
  stats: null,
  recentProgress: null,
  visualizationMode: 'standard' as const,
  selectedNodeId: null
};

// Create the network store
export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      initializeNetwork: (userId: string) => {
        // Only initialize if no network exists or user ID changed
        const currentNetwork = get().network;
        if (!currentNetwork || currentNetwork.userId !== userId) {
          const newNetwork = createInitialNetwork(userId);
          const stats = calculateNetworkStats(newNetwork);
          
          set({ 
            network: newNetwork,
            stats,
            recentProgress: null
          });
        }
      },
      
      updateNetworkFromGame: (gameState: any, rivalState: any) => {
        const network = get().network;
        if (!network) return;
        
        // Update network based on game results
        const { updatedNetwork, progress } = updateNetworkFromGameResults(
          network,
          gameState,
          rivalState
        );
        
        // Calculate updated statistics
        const stats = calculateNetworkStats(updatedNetwork);
        
        set({
          network: updatedNetwork,
          stats,
          recentProgress: progress
        });
      },
      
      selectNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },
      
      setVisualizationMode: (mode: 'standard' | 'domains' | 'levels' | 'connections') => {
        set({ visualizationMode: mode });
      },
      
      resetNetwork: () => {
        set(initialState);
      }
    }),
    {
      name: 'ai-fight-club-network-storage',
      partialize: (state) => ({
        network: state.network,
        visualizationMode: state.visualizationMode
      })
    }
  )
);
