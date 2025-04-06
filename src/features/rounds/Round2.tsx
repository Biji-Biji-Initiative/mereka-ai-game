'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/store';
import AIVisualizer from '@/components/ui/ai-visualizer';
import { useSubmitResponse } from '@/services/api/services/challengeService';

export default function Round2() {
  const router = useRouter();
  const [userAnalysis, setUserAnalysis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  
  // Get game store values and actions using the consolidated store
  const {
    responses, 
    focus, 
    saveRound2Response, 
    currentChallenge
  } = useGameStore(state => ({
    responses: state.responses,
    focus: state.focus,
    saveRound2Response: state.saveRound2Response,
    currentChallenge: state.currentChallenge
  }));
  
  // Check if we have round1 response and focus/challenge
  const round1Data = responses?.round1;
  
  // If no round1 data or focus/challenge, redirect to previous step
  useEffect(() => {
    if (!round1Data?.userResponse) {
      console.warn('Round1 not completed, redirecting to round1');
      router.push('/round1');
      return;
    }
    
    if (!focus || !currentChallenge) {
      console.warn('Missing focus or challenge, redirecting to focus page');
      router.push('/focus');
      return;
    }
  }, [focus, round1Data, currentChallenge, router]);
  
  // Submit response mutation
  const submitResponseMutation = useSubmitResponse();
  
  // Handle user response submission
  const handleSubmit = useCallback(async () => {
    const challengeId = currentChallenge?.id;
    if (!userAnalysis.trim() || !challengeId) {
      return;
    }
    
    setIsSubmitting(true);
    setShowAiThinking(true);
    
    try {
      // Rely on type inference for the request object
      const submissionRequest = {
        challengeId: challengeId,
        response: userAnalysis,
        round: 2
      };
      
      await submitResponseMutation.mutateAsync(submissionRequest);
      
      // Save response to game state
      saveRound2Response(userAnalysis);
      
      // AI thinking and phase transition handled by store/navigator

    } catch (error) {
      console.error('Error submitting analysis:', error);
      setShowAiThinking(false); // Stop thinking animation on error
    } finally {
      // Let page transition handle loading state naturally
    }
  }, [userAnalysis, currentChallenge, submitResponseMutation, saveRound2Response]);
  
  // Loading state (check if challenge exists)
  if (!currentChallenge) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-600 dark:text-gray-300">
          Loading challenge details...
        </div>
      </div>
    );
  }

  // Safely access potential AI response and prompts from challenge object
  const aiResponseForRound2 = currentChallenge.aiResponseForRound2 || "AI's approach is not available for this challenge.";
  const round2Prompt = currentChallenge.round2Prompt || "Now let's see how AI would approach your challenge. Review the AI's response and consider where your human edge provides advantages.";
  const round2Placeholder = currentChallenge.round2Placeholder || "Compare your approach with the AI's. Where do you see your human edge?";
  const round1ChallengeDescription = currentChallenge.description || round1Data?.challenge || "Challenge description not available";

  return (
    <div className="space-y-8">
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Round 2: AI's Response & Your Analysis
        </CardTitle>
        <CardDescription>
          {typeof round2Prompt === 'string' ? round2Prompt : ''}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Your Challenge Scenario:</h3>
          <div className="border p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 mb-4">
            <p className="text-gray-800 dark:text-gray-200">
              {round1ChallengeDescription || ''}
            </p>
          </div>
          
          <h3 className="font-semibold text-lg mb-2">Your Round 1 Response:</h3>
          <div className="border p-4 rounded-lg bg-white dark:bg-gray-800 mb-6">
            <p className="text-gray-800 dark:text-gray-200">
              {round1Data?.userResponse || "Your response not available"}
            </p>
          </div>
        </div>
        
        <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-lg mb-2">AI's Approach:</h3>
          <p className="text-gray-800 dark:text-gray-200">
            {typeof aiResponseForRound2 === 'string' ? aiResponseForRound2 : ''}
          </p>
        </div>
        
        <div className="space-y-3 mt-4">
          <h3 className="font-semibold text-lg">Your Analysis:</h3>
          <Textarea 
            value={userAnalysis}
            onChange={(e) => setUserAnalysis(e.target.value)}
            placeholder={typeof round2Placeholder === 'string' ? round2Placeholder : ''}
            className="min-h-[150px] resize-y"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Think about the strengths and limitations of both approaches. How does your human perspective provide unique value?
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/round1')}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !userAnalysis.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          {isSubmitting ? 'Submitting...' : 'Continue to Round 3'}
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
            The AI is evaluating your comparison to identify human edge factors.
          </p>
        </div>
      </div>
    )}
    </div>
  );
}
