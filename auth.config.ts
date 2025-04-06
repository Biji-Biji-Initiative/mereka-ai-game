import type { NextAuthConfig, Session, User, Account, Profile } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import type { AdapterUser } from "@auth/core/adapters";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Authentication configuration file for managing game progression and route access
 */

// Define the different game phases
export enum GamePhase {
  PUBLIC = 'public',
  ACCOUNT_CREATED = 'account_created',
  EMAIL_VERIFIED = 'email_verified',
  TUTORIAL_COMPLETED = 'tutorial_completed',
  GAME_STARTED = 'game_started',
  GAME_COMPLETED = 'game_completed',
}

// Define the progression paths for the game
export const PROGRESSION_PATHS: Record<GamePhase, GamePhase[]> = {
  [GamePhase.PUBLIC]: [],
  [GamePhase.ACCOUNT_CREATED]: [GamePhase.PUBLIC],
  [GamePhase.EMAIL_VERIFIED]: [GamePhase.PUBLIC, GamePhase.ACCOUNT_CREATED],
  [GamePhase.TUTORIAL_COMPLETED]: [GamePhase.PUBLIC, GamePhase.ACCOUNT_CREATED, GamePhase.EMAIL_VERIFIED],
  [GamePhase.GAME_STARTED]: [GamePhase.PUBLIC, GamePhase.ACCOUNT_CREATED, GamePhase.EMAIL_VERIFIED, GamePhase.TUTORIAL_COMPLETED],
  [GamePhase.GAME_COMPLETED]: [GamePhase.PUBLIC, GamePhase.ACCOUNT_CREATED, GamePhase.EMAIL_VERIFIED, GamePhase.TUTORIAL_COMPLETED, GamePhase.GAME_STARTED],
};

// Map game phases to their corresponding routes
export const PHASE_ROUTES: Record<GamePhase, string> = {
  [GamePhase.PUBLIC]: '/',
  [GamePhase.ACCOUNT_CREATED]: '/profile',
  [GamePhase.EMAIL_VERIFIED]: '/verify-email',
  [GamePhase.TUTORIAL_COMPLETED]: '/tutorial',
  [GamePhase.GAME_STARTED]: '/game',
  [GamePhase.GAME_COMPLETED]: '/completed',
};

// Map routes to their required game phases
export const ROUTE_PHASES: Record<string, GamePhase> = {
  '/': GamePhase.PUBLIC,
  '/login': GamePhase.PUBLIC,
  '/register': GamePhase.PUBLIC,
  '/profile': GamePhase.ACCOUNT_CREATED,
  '/verify-email': GamePhase.EMAIL_VERIFIED,
  '/tutorial': GamePhase.TUTORIAL_COMPLETED,
  '/game': GamePhase.GAME_STARTED,
  '/completed': GamePhase.GAME_COMPLETED,
};

// NextAuth.js configuration
export const authConfig = {
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error',
    verifyRequest: '/verify-request',
    newUser: '/profile',
  },
  callbacks: {
    authorized({ request, auth }: { request: NextRequest; auth: Session | null }): boolean | NextResponse | undefined {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      
      // Public routes are always accessible
      const isPublicRoute = ['/login', '/register', '/'].includes(pathname);
      if (isPublicRoute) {
        return true;
      }
      
      // Protected routes require login
      if (!isLoggedIn) {
        return false;
      }
      
      // Check if user has reached the game phase required for this route
      const requiredPhase = ROUTE_PHASES[pathname];
      if (!requiredPhase) {
        return true; // If no specific phase is required, allow access
      }
      
      // Get user's current game phase from the user object
      const userPhase = (auth?.user as any)?.gamePhase || GamePhase.PUBLIC;
      
      // Check if user has completed all prerequisites for the required phase
      const prerequisites = PROGRESSION_PATHS[requiredPhase] || [];
      return prerequisites.includes(userPhase) || userPhase === requiredPhase;
    },
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      // If user object exists (on sign in), add gamePhase to token
      if (user) {
        // Persist gamePhase from user object to token
        // Ensure your User type / AdapterUser type includes gamePhase or cast appropriately
        token.gamePhase = (user as any)?.gamePhase || GamePhase.PUBLIC; 
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add gamePhase from token to the session object
      if (session.user && token.gamePhase) {
        // Add gamePhase to the Session User type if necessary
        (session.user as any).gamePhase = token.gamePhase as GamePhase;
      }
      return session;
    },
  },
  // Note: Providers will be configured in the auth.ts route handler
};

export default authConfig;
