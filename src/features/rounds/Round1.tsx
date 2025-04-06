'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import AIVisualizer from '@/components/ui/ai-visualizer';
import { useGenerateChallenge, useSubmitResponse } from '@/services/api/services';
// Import types from centralized type system
// import { GenerateChallengeRequest } from '@/types/api';

// Define additional types if not in the centralized type system
interface ResponseSubmissionRequest {
  userEmail?: string;
  challengeId: string;
  response: string;
  round: number;
}

export default function Round1() {
  const router = useRouter();
  const [challenge, setChallenge] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get current game state values and actions with individual selectors
  const traits = useGameStore(state => state.traits);
  const focus = useGameStore(state => state.selectedFocus);
  const currentChallenge = useGameStore(state => state.roundResults.round1);
  const saveRound1Response = useGameStore(state => state.setRoundResult);
  const setCurrentStep = useGameStore(state => state.setCurrentStep);
  const completedSteps = useGameStore(state => state.completedSteps);
  
  // Generate challenge mutation
  const generateChallengeMutation = useGenerateChallenge();
  
  // Submit response mutation
  const submitResponseMutation = useSubmitResponse();
  
  // Generate a challenge based on the user's traits and focus area
  const generateChallenge = useCallback(async () => {
    if (!focus) {
      console.error('No focus area selected, cannot generate challenge');
      return;
    }
    
    // If we already have a challenge saved in the roundResults, use that
    if (currentChallenge?.challenge) {
      setChallenge(currentChallenge.challenge);
      setIsLoading(false);
      return;
    }
    
    // Otherwise, generate a new challenge
    setIsLoading(true);
    
    try {
      // Create request using the centralized GenerateChallengeRequest type
      const apiRequest = {
        focusArea: focus.id,
        personalityContext: {
          traits: traits || [],
        },
        professionalContext: {
          title: 'Professional', // Default value
          location: 'Global', // Default value
        },
        difficulty: 'intermediate', // Default value
      };
      
      const result = await generateChallengeMutation.mutateAsync(apiRequest);
      
      if (result.success && result.data) {
        // Use description or title as primary source, fallback to stringified data
        const challengeData = result.data as Record<string, unknown>;
        const challengeContent = (challengeData.description || challengeData.title || JSON.stringify(challengeData)) as string;
        
        // Set local state for display
        setChallenge(challengeContent || '');
        
        // Save challenge to game state - but don't include this in the dependencies array
        // to prevent infinite loops
        setTimeout(() => {
          saveRound1Response('round1', { challenge: challengeContent });
        }, 0);
      } else {
        throw new Error('Failed to generate challenge');
      }
    } catch (error: unknown) {
      console.error('Error generating challenge:', error);
    } finally {
      setIsLoading(false);
    }
  }, [focus, traits, currentChallenge, generateChallengeMutation]); // Removed saveRound1Response from dependencies
  
  // Generate challenge on component mount, but first check prerequisites are met
  useEffect(() => {
    // Check if the 'focus' step is in the completedSteps
    if (!completedSteps.includes('focus')) {
      console.warn('Focus step not completed, redirecting to focus page');
      router.push('/focus');
      return;
    }
    
    // Check if we have a valid focus object
    if (!focus || !focus.id) {
      console.warn('No focus selected, redirecting to focus page');
      router.push('/focus');
      return;
    }
    
    // Only generate challenge if prerequisites are met
    console.log('Prerequisites met, generating challenge');
    void generateChallenge();
    
  }, [focus, completedSteps, generateChallenge, router]);
  
  // State for AI thinking visualization
  const [showAiThinking, setShowAiThinking] = useState(false);

  // Handle user response submission
  const handleSubmit = async () => {
    if (!userResponse.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    setShowAiThinking(true);
    
    try {
      // Create submission request
      const submissionRequest: ResponseSubmissionRequest = {
        challengeId: focus?.id || 'challenge-1', // Use focus ID if available
        response: userResponse,
        round: 1
      };
      
      // Submit response to API
      await submitResponseMutation.mutateAsync(submissionRequest);
      
      // Save response to game state
      saveRound1Response('round1', { 
        challenge: challenge,
        userResponse: userResponse 
      });
      
      // Simulate AI thinking time
      setTimeout(() => {
        setShowAiThinking(false);
        // Set next step
        setCurrentStep('round2');
        // Navigate to next round
        router.push('/round2');
      }, 3000);
    } catch (error) {
      console.error('Error submitting response:', error);
      setShowAiThinking(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-600 dark:text-gray-300">
          Generating your challenge...
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Round 1: Define The Challenge
        </CardTitle>
        <CardDescription>
          In this round, we&apos;ll define a challenge that highlights your unique human capabilities in your chosen focus area.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 dark:bg-indigo-900/20">
          <h3 className="font-semibold text-lg mb-2">Your Challenge:</h3>
          <p className="text-gray-800 dark:text-gray-200">
            {challenge}
          </p>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Your Response:</h3>
          <Textarea 
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="Type your response here..."
            className="min-h-[150px] resize-y"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Consider how your human traits and capabilities provide unique value in addressing this challenge.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/focus')}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !userResponse.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          {isSubmitting ? 'Submitting...' : 'Continue to Round 2'}
        </Button>
      </CardFooter>
    </Card>
    
    {/* AI Thinking Visualization */}
    {showAiThinking && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
          <h3 className="text-xl font-bold mb-4">AI is analyzing your response</h3>
          <AIVisualizer />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            The AI is evaluating your response against its own capabilities to identify your human edge.
          </p>
        </div>
      </div>
    )}
    </div>
  );
}
