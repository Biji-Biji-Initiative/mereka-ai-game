import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Import UIChallenge from types/api for consistency
import { UIChallenge, UIUser } from '@/types/api';

// Define our game phases
export enum GamePhase {
  WELCOME = 'welcome',
  CONTEXT = 'context',
  TRAITS = 'traits',
  ATTITUDES = 'attitudes',
  FOCUS = 'focus',
  ROUND1 = 'round1',
  ROUND2 = 'round2',
  ROUND3 = 'round3',
  RESULTS = 'results'
}

// Define the trait assessment format
export interface Trait {
  id: string;
  name: string;
  description: string;
  value: number;
  lowLabel?: string;
  highLabel?: string;
}

// Define the focus area format
export interface FocusArea {
  id: string;
  name: string;
  description: string;
  matchLevel: number;
}

// Define a round response format
export interface RoundResponse {
  userResponse: string;
  aiResponse?: string;
  challenge?: string;
  analysis?: string;
}

// Define the human edge profile format
export interface Profile {
  id: string;
  traits: Trait[];
  focus: FocusArea;
  strengths: string[];
  insights: string;
  recommendations: string[];
  createdAt: string;
  aiAttitudes?: AiAttitude[];
}

// Define AI insights format
export interface AiInsight {
  round: number;
  insight: string;
  timestamp: string;
}

// Define AI attitudes format
export interface AiAttitude {
  id: string;
  attitude: string;
  strength: number;
  description?: string;
  lowLabel?: string;
  highLabel?: string;
}

// StoreChallenge type removed - now using UIChallenge directly from types/api

// Define the user info structure more concretely
export interface UserInfo {
  name?: string;
  fullName?: string;
  email?: string; // Keep email optional for now
  professionalTitle?: string;
  location?: string;
  bio?: string;
  // Add other relevant fields if needed, e.g., avatarUrl
  avatarUrl?: string;
}

// Define the shape of our game state
export interface GameState {
  isAuthenticated: boolean; // <-- NEW: Explicit auth flag
  userId?: string; // Optional, might be set on login
  sessionId: string | null;
  gamePhase: GamePhase;
  userInfo: UserInfo; // Use the defined interface
  personality: {
    traits: Trait[];
    attitudes: AiAttitude[];
    strengths?: string[]; // Areas of human advantage
    strengthDescriptions?: string[];
    interpersonalInsights?: string;
    collaborationStyle?: string;
    communicationPreference?: string;
  };
  focus: FocusArea | null;
  currentChallenge: UIChallenge | null;
  responses: {
    round1?: RoundResponse;
    round2?: RoundResponse;
    round3?: RoundResponse;
  };
  profile: Profile | null;
  aiInsights: AiInsight[];
  history: Array<{ action: string; timestamp: string; data?: Record<string, unknown> }>;
  timestamp?: string;
  isLoading: boolean;
  error: string | null;
}

// Define the shape of our game store actions
interface GameStoreActions {
  startNewSession: () => void;
  resetGame: () => void;
  setGamePhase: (phase: GamePhase) => void;
  saveUserInfo: (info: Partial<UserInfo>) => void; // Use Partial<UserInfo>
  updateUserInfo: (info: Partial<UIUser>) => void; // NEW: Method for profile updates
  saveTraits: (traits: Trait[]) => void;
  saveAttitudes: (attitudes: AiAttitude[]) => void;
  saveFocus: (focus: FocusArea) => void;
  setCurrentChallenge: (challenge: UIChallenge) => void;
  clearCurrentChallenge: () => void;
  saveRound1Response: (response: string) => void;
  saveRound2Response: (response: string) => void;
  saveRound3Response: (response: string) => void;
  saveAIResponses: (round: number, response: string) => void;
  saveChallenge: (round: number, challenge: string) => void; // Consider removing if currentChallenge covers this
  saveProfile: (profile: Profile) => void;
  saveProfileId: (profileId: string) => void;
  addAiInsight: (round: number, insight: string) => void;
  addAiAttitude: (attitude: AiAttitude) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  getIsPhaseCompleted: (phase: GamePhase) => boolean; // Assuming this exists or will be implemented
  login: (user: { userId: string; userInfo: UserInfo }) => void; // <-- NEW Login action
  logout: () => void; // <-- NEW Logout action
  updatePersonality: (updatedPersonality: Pick<GameState, 'personality'>) => void; // <-- NEW Update personality action
}

// Combine state and actions for the store type
interface GameStoreState extends GameState, GameStoreActions {}

// Define the initial state
const initialState: GameState = {
  isAuthenticated: false, // Default to not authenticated
  userId: undefined,
  sessionId: null,
  gamePhase: GamePhase.WELCOME,
  userInfo: {},
  personality: {
    traits: [],
    attitudes: [],
  },
  focus: null,
  currentChallenge: null,
  responses: {},
  profile: null,
  aiInsights: [],
  history: [],
  isLoading: false,
  error: null,
};

// Create the store with persistence and devtools
export const useGameStore = create<GameStoreState>()(
  devtools(
    persist<GameStoreState>(
      (set, get) => ({
        // Initial state values spread from initialState
        ...initialState,

        // Actions
        startNewSession: () => set({ sessionId: uuidv4() }),

        resetGame: () => {
          console.log("Resetting game state...");
          
          // First, add history entry for reset
          set(state => ({
            history: [...state.history, { 
              action: 'GAME_RESET', 
              timestamp: new Date().toISOString() 
            }]
          }));
          
          // Then reset to initial state but preserve the updated history
          set(state => {
            const history = [...state.history];
            return { 
              ...initialState, 
              sessionId: uuidv4(),
              history,
              gamePhase: GamePhase.WELCOME
            };
          });
          
          // Clear any persisted state in localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('human-edge-game-storage');
            } catch (e) {
              console.error('Failed to clear localStorage:', e);
            }
          }
        },

        setGamePhase: (phase: GamePhase) => set({ gamePhase: phase }),

        saveUserInfo: (info: Partial<UserInfo>) => {
          set((state) => ({ userInfo: { ...state.userInfo, ...info } }));
          // Transition logic remains the same
          if (get().gamePhase === GamePhase.CONTEXT) {
            set({ gamePhase: GamePhase.TRAITS });
          }
        },

        // NEW method for updating user info from profile page
        updateUserInfo: (info: Partial<UIUser>) => {
          console.warn("Updating user info:", info);
          set((state) => ({ 
            userInfo: { 
              ...state.userInfo, 
              ...info
            } 
          }));
          // Add to history
          set(state => ({
            history: [...state.history, { 
              action: 'USER_INFO_UPDATED', 
              timestamp: new Date().toISOString(),
              data: { fields: Object.keys(info) }
            }]
          }));
        },

        saveTraits: (traits: Trait[]) => {
          set(state => ({ personality: { ...state.personality, traits } }));
          // After saving traits, go to ATTITUDES phase (if it exists)
          if (get().gamePhase === GamePhase.TRAITS) {
            // Check if ATTITUDES phase exists, otherwise skip to FOCUS (fallback)
            if (GamePhase.ATTITUDES) { // Simple check if enum exists
              set({ gamePhase: GamePhase.ATTITUDES }); 
            } else {
              console.warn("GamePhase.ATTITUDES not found, skipping to FOCUS");
              set({ gamePhase: GamePhase.FOCUS });
            }
          }
        },

        saveAttitudes: (attitudes: AiAttitude[]) => {
          set(state => ({ personality: { ...state.personality, attitudes } }));
          // Transition to FOCUS after ATTITUDES
          if (get().gamePhase === GamePhase.ATTITUDES) {
            set({ gamePhase: GamePhase.FOCUS });
          }
        },

        saveFocus: (focus: FocusArea) => {
          set({ focus });
          
          // REMOVED: Set game phase to ROUND1 when focus is saved
          // We rely on GamePhaseNavigator effect to handle this transition after challenge generation
          // if (get().gamePhase === GamePhase.FOCUS) {
          //   console.log("Setting phase to ROUND1 after saving focus"); 
          //   set({ gamePhase: GamePhase.ROUND1 });
          // }
        },

        setCurrentChallenge: (challenge: UIChallenge) => {
          // No need to map between types since we're now using UIChallenge directly
          set({
            currentChallenge: challenge,
            history: [
              ...get().history,
              {
                action: 'CHALLENGE_SELECTED',
                timestamp: new Date().toISOString(),
                data: { 
                  challengeId: challenge.id, 
                  challengeTitle: challenge.title || 'Untitled Challenge' 
                }
              }
            ]
          });
        },

        clearCurrentChallenge: () => set({ currentChallenge: null }),

        saveRound1Response: (userResponse: string) => {
          set(state => ({
            responses: { ...state.responses, round1: { ...state.responses.round1, userResponse } }
          }));
          if (get().gamePhase === GamePhase.ROUND1) {
            console.log("Setting phase to ROUND2 after saving round 1 response");
            set({ gamePhase: GamePhase.ROUND2 });
          }
        },
        saveRound2Response: (userResponse: string) => {
          set(state => ({
            responses: { ...state.responses, round2: { ...state.responses.round2, userResponse } }
          }));
          if (get().gamePhase === GamePhase.ROUND2) {
            set({ gamePhase: GamePhase.ROUND3 });
          }
        },
        saveRound3Response: (userResponse: string) => {
          set(state => ({
            responses: { ...state.responses, round3: { ...state.responses.round3, userResponse } }
          }));
          if (get().gamePhase === GamePhase.ROUND3) {
            set({ gamePhase: GamePhase.RESULTS });
          }
        },

        saveAIResponses: (round: number, aiResponse: string) => {
          const roundKey = `round${round}` as 'round1' | 'round2' | 'round3';
          set(state => ({
            responses: { ...state.responses, [roundKey]: { ...state.responses[roundKey], aiResponse } }
          }));
        },

        // This might be redundant if currentChallenge holds the full object
        saveChallenge: (round: number, challengeDesc: string) => {
          const roundKey = `round${round}` as 'round1' | 'round2' | 'round3';
          set(state => ({
            responses: { ...state.responses, [roundKey]: { ...state.responses[roundKey], challenge: challengeDesc } }
          }));
        },

        saveProfile: (profile: Profile) => set({ profile }),

        saveProfileId: (profileId: string) => {
           // Ensure profile exists before trying to update its ID
           set(state => ({ profile: state.profile ? { ...state.profile, id: profileId } : null }));
        },

        addAiInsight: (round: number, insight: string) => {
          // Logic to add/update insight (simplified from audit)
          set(state => ({
             aiInsights: [
                ...state.aiInsights.filter(i => i.round !== round), // Remove existing for this round
                { round, insight, timestamp: new Date().toISOString() } // Add new one
             ]
          }));
        },

        addAiAttitude: (attitude: AiAttitude) => {
           // Logic to add/update attitude (simplified from audit)
           set(state => ({
              personality: {
                 ...state.personality,
                 attitudes: [
                    ...state.personality.attitudes.filter(a => a.id !== attitude.id), // Remove existing
                    attitude // Add new/updated one
                 ]
              }
           }));
        },

        setIsLoading: (isLoading: boolean) => set({ isLoading }),

        setError: (error: string | null) => set({ error }),

        // Example implementation - adjust based on actual requirements
        getIsPhaseCompleted: (phase: GamePhase): boolean => {
           const state = get();
           switch (phase) {
             case GamePhase.CONTEXT: return !!state.userInfo.name && !!state.userInfo.professionalTitle;
             case GamePhase.TRAITS: return state.personality.traits.length > 0;
             case GamePhase.ATTITUDES: return state.personality.attitudes.length > 0;
             case GamePhase.FOCUS: return !!state.focus;
             case GamePhase.ROUND1: return !!state.responses.round1?.userResponse;
             case GamePhase.ROUND2: return !!state.responses.round2?.userResponse;
             case GamePhase.ROUND3: return !!state.responses.round3?.userResponse;
             case GamePhase.RESULTS: return !!state.profile;
             default: return false;
           }
        },

        // --- NEW AUTH ACTIONS ---
        login: (user: { userId: string; userInfo: UserInfo }) => {
           console.warn("Logging in user:", user.userId);
           set({
             isAuthenticated: true,
             userId: user.userId,
             userInfo: { ...get().userInfo, ...user.userInfo }, // Merge existing with new login info
             error: null // Clear any previous errors
           });
           // Add to history
           set(state => ({
              history: [...state.history, { action: 'LOGIN', timestamp: new Date().toISOString(), data: { userId: user.userId }}]
           }));
        },

        logout: () => {
           console.warn("Logging out user");
           set({
             isAuthenticated: false,
             userId: undefined,
             // Decide if userInfo should be cleared or kept partially
             // userInfo: {}, // Option 1: Clear all user info
             userInfo: { // Option 2: Keep non-sensitive info if needed later?
               name: get().userInfo.name, // Keep name?
               // email: undefined, // Clear email
               professionalTitle: get().userInfo.professionalTitle, // Keep title?
               location: get().userInfo.location // Keep location?
             },
             error: null
           });
           // Add to history
           set(state => ({
              history: [...state.history, { action: 'LOGOUT', timestamp: new Date().toISOString() }]
           }));
        },

        // --- NEW PERSONALITY ACTION ---
        updatePersonality: (updatedPersonality) => {
          console.warn("Updating personality data");
          set(state => ({ 
            personality: {
              ...state.personality,
              ...updatedPersonality.personality
            }
          }));
          // Add to history
          set(state => ({
            history: [...state.history, { 
              action: 'PERSONALITY_UPDATED', 
              timestamp: new Date().toISOString()
            }]
          }));
        },
        // --- END NEW PERSONALITY ACTION ---

        onRehydrateStorage: (state: GameState | undefined) => {
          if (state) {
            console.log('Hydrated state:', state);
          }
          console.log('Hydration finished.');
        }
      }),
      {
        name: 'human-edge-game-storage',
      }
    ),
    {
      name: "GameStore",
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Initialize the store client-side only to avoid SSR hydration issues
if (typeof window !== 'undefined') {
  void useGameStore.persist.rehydrate();
}

// Create a hook to check if a phase is completed
export function useIsPhaseCompleted(phase: GamePhase): boolean {
  return useGameStore((state) => state.getIsPhaseCompleted(phase));
}
