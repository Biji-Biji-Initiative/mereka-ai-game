'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/store';
import AIVisualizer from '@/components/ui/ai-visualizer';
import { useSubmitResponse } from '@/services/api/services/challengeService';
import { useGenerateProfile } from '@/services/api/services/profileService';

export function Round3() {
  const router = useRouter();
  const [userResponse, setUserResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  
  // Get game store values and actions
  const { 
    personality, 
    userInfo, 
    focus, 
    responses, 
    currentChallenge,
    saveRound3Response, 
    saveProfileId
  } = useGameStore(state => ({
    personality: state.personality,
    userInfo: state.userInfo,
    focus: state.focus,
    responses: state.responses,
    currentChallenge: state.currentChallenge,
    saveRound3Response: state.saveRound3Response,
    saveProfileId: state.saveProfileId
  }));
  
  // Check if user has completed round 2 and if we have a current challenge
  const hasCompletedRound2 = !!responses?.round2?.userResponse;
  
  // Redirect if essential data is missing
  useEffect(() => {
    if (!hasCompletedRound2) {
      console.warn('Round2 not completed, redirecting to round2');
      router.push('/round2');
      return;
    }
    
    if (!focus || !currentChallenge) {
      console.warn('Missing focus or challenge, redirecting to focus page');
      router.push('/focus');
      return;
    }
  }, [hasCompletedRound2, focus, currentChallenge, router]);
  
  // Submit response mutation
  const submitResponseMutation = useSubmitResponse();
  
  // Generate profile mutation
  const generateProfileMutation = useGenerateProfile();
  
  // Handle user response submission and generate profile
  const handleSubmit = useCallback(async () => {
    if (!userResponse.trim() || !currentChallenge?.id || !focus) {
      return;
    }
    
    setIsSubmitting(true);
    setShowAiThinking(true);
    
    try {
      // Rely on type inference for the request object
      const submissionRequest = {
        challengeId: currentChallenge.id,
        response: userResponse,
        round: 3
      };
      
      // Submit response to API using challenge ID from store
      await submitResponseMutation.mutateAsync(submissionRequest);
      
      // Save response to game state
      saveRound3Response(userResponse);

      // Generate profile
      const profileResult = await generateProfileMutation.mutateAsync({
        focus: focus.id,
        responses: {
          round1: responses.round1 ? {
            userResponse: responses.round1.userResponse || '',
            challenge: responses.round1.challenge,
            aiResponse: undefined
          } : undefined,
          round2: responses.round2 ? {
            userResponse: responses.round2.userResponse || '',
            challenge: undefined,
            aiResponse: undefined
          } : undefined,
          round3: {
            userResponse: userResponse,
            challenge: currentChallenge.description || '',
            aiResponse: undefined
          }
        }
      });
      
      // Simulate AI thinking time for profile generation
      setTimeout(() => {
        setShowAiThinking(false);
        
        if (profileResult && profileResult.success && profileResult.data?.id) {
          // Save profile ID to game state
          saveProfileId(profileResult.data.id.toString());
          
          // Phase transition and navigation handled by store/GamePhaseNavigator
        } else {
          throw new Error('Failed to generate profile');
        }
      }, 4000); // Slightly longer time for profile generation
      
    } catch (error) {
      console.error('Error submitting response:', error);
      setShowAiThinking(false);
    } finally {
      // Let page transition handle loading state naturally
    }
  }, [userResponse, currentChallenge, focus, responses, submitResponseMutation, saveRound3Response, generateProfileMutation, saveProfileId]);
  
  // Loading state
  if (!currentChallenge) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-600 dark:text-gray-300">
          Loading challenge details...
        </div>
      </div>
    );
  }
  
  // Extract challenge content safely
  const challengeContent = currentChallenge.round3Description || currentChallenge.description || 'No challenge description available.';
  const round3Prompt = currentChallenge.round3Prompt || "Now that you've seen how AI approaches your challenge, let's push your thinking further with a final challenge.";
  const round3Placeholder = currentChallenge.round3Placeholder || "Type your response here...";
  
  return (
    <div className="space-y-8">
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Round 3: Final Challenge
        </CardTitle>
        <CardDescription>
          {round3Prompt || "Now that you've seen how AI approaches your challenge, let's push your thinking further with a final challenge."}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 dark:bg-indigo-900/20">
          <h3 className="font-semibold text-lg mb-2">Final Challenge:</h3>
          <p className="text-gray-800 dark:text-gray-200">
            {challengeContent || "No challenge description available."}
          </p>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Your Response:</h3>
          <Textarea 
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder={round3Placeholder || "Type your response here..."}
            className="min-h-[150px] resize-y"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is your chance to demonstrate your human edge in your focus area. Think deeply about what makes your approach uniquely human.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/round2')}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !userResponse.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          {isSubmitting ? 'Generating Profile...' : 'See Your Human Edge Profile'}
        </Button>
      </CardFooter>
    </Card>
    
    {/* AI Thinking Visualization */}
    {showAiThinking && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
          <h3 className="text-xl font-bold mb-4">AI is generating your Human Edge Profile</h3>
          <AIVisualizer />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            The AI is analyzing all your responses to create a comprehensive profile of your human edge.
          </p>
        </div>
      </div>
    )}
    </div>
  );
}
