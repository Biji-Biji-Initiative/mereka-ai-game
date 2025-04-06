import NextAuth from "next-auth";
import { authConfig } from "../../../../../auth.config";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Add your authentication providers here
  providers: [
    // Example: GitHub provider
    // GitHub({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
  ],
}); 