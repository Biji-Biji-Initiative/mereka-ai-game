'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useGameStore } from '@/store/useGameStore';
import { useRouter } from 'next/navigation';

export function AuthForm({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  // Get user info from game store
  const userInfo = useGameStore(state => state.userInfo);
  const saveUserInfo = useGameStore(state => state.saveUserInfo);
  
  // Pre-fill email if available in game store
  useState(() => {
    if (userInfo?.email) {
      setEmail(userInfo.email);
    }
  });
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save email to game store
      saveUserInfo({ email });
      
      // Sign in with email (magic link)
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/focus', // Redirect to focus selection after authentication
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in",
      });
      
      // Redirect to verify page
      router.push('/verify-request');
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication failed",
        description: "There was a problem signing in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signIn('google', {
        callbackUrl: '/focus', // Redirect to focus selection after authentication
      });
    } catch (error) {
      console.error('Google authentication error:', error);
      toast({
        title: "Authentication failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'signin' 
            ? 'Sign in to save your progress and see your results'
            : 'Create an account to save your progress and see your results'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue with Email'}
          </Button>
        </form>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          {mode === 'signin' 
            ? "Don't have an account? " 
            : "Already have an account? "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-normal text-sm"
            onClick={() => router.push(mode === 'signin' ? '/signup' : '/signin')}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
