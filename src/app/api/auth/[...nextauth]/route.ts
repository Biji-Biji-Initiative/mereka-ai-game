import { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { authConfig } from '../../../../../auth.config';

// Create the NextAuth handler
const handler = NextAuth({
  ...authConfig,
  providers: [
    // Google provider for social login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // Email provider for magic link authentication
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || ''
        }
      },
      from: process.env.EMAIL_FROM || 'noreply@mereka-ai-game.com',
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
});

// Export the GET and POST handlers
export { handler as GET, handler as POST };

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
