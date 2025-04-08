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
import { EvaluationResult, useEvaluateRound } from '@/services/evaluationService';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function Round3() {
  const router = useRouter();
  const [userResponse, setUserResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  // Get game store values and actions using individual selectors for better type safety
  const personality = useGameStore(state => state.personality || { traits: [], attitudes: [] });
  const userInfo = useGameStore(state => state.userInfo || {});
  const focus = useGameStore(state => state.focus);
  const responses = useGameStore(state => state.responses || {});
  const currentChallenge = useGameStore(state => state.currentChallenge);
  const saveRound3Response = useGameStore(state => state.saveRound3Response);
  const saveProfileId = useGameStore(state => state.saveProfileId);
  
  // Get evaluation function
  const evaluateRound = useEvaluateRound();
  
  // Check if user has completed round 2 and if we have a current challenge
  const hasCompletedRound2 = !!(responses.round2 && responses.round2.userResponse);
  
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

      // Evaluate the response
      if (currentChallenge && focus) {
        const evaluationResult = await evaluateRound(
          3,
          { userResponse: userResponse },
          currentChallenge.description || '',
          focus.id
        );
        
        setEvaluation(evaluationResult);
        
        // Generate profile
        const profileResult = await generateProfileMutation.mutateAsync({
          focus: focus.id,
          responses: {
            round1: responses.round1 ? {
              userResponse: responses.round1.userResponse || '',
              challenge: responses.round1.challenge,
              aiResponse: undefined
            } : { userResponse: '', challenge: undefined, aiResponse: undefined },
            round2: responses.round2 ? {
              userResponse: responses.round2.userResponse || '',
              challenge: undefined,
              aiResponse: undefined
            } : { userResponse: '', challenge: undefined, aiResponse: undefined },
            round3: {
              userResponse: userResponse,
              challenge: currentChallenge.description || '',
              aiResponse: undefined
            }
          }
        });
        
        // Show evaluation after AI thinking animation
        setTimeout(() => {
          setShowAiThinking(false);
          setShowEvaluation(true);
          
          if (profileResult && profileResult.success && profileResult.data?.id) {
            // Save profile ID to game state
            saveProfileId(profileResult.data.id.toString());
          }
        }, 2000);
      } else {
        // If we can't evaluate, just proceed
        setShowAiThinking(false);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setShowAiThinking(false);
      setIsSubmitting(false);
    }
  }, [userResponse, currentChallenge, focus, responses, submitResponseMutation, saveRound3Response, generateProfileMutation, saveProfileId, evaluateRound]);
  
  // Handle continuing to results page after evaluation
  const handleContinue = useCallback(() => {
    setShowEvaluation(false);
    // Set game phase to RESULTS
    useGameStore.getState().setGamePhase(useGameStore.getState().GamePhase.RESULTS);
    router.push('/results');
  }, [router]);
  
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
    {!showEvaluation ? (
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
            {isSubmitting ? 'Submitting...' : 'Submit Final Response'}
          </Button>
        </CardFooter>
      </Card>
    ) : (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Round 3 Evaluation
          </CardTitle>
          <CardDescription>
            Here's how your final response demonstrates your human edge
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {evaluation && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Your Performance</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Creativity</span>
                      <span>{Math.round(evaluation.metrics.creativity)}%</span>
                    </div>
                    <Progress value={evaluation.metrics.creativity} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Practicality</span>
                      <span>{Math.round(evaluation.metrics.practicality)}%</span>
                    </div>
                    <Progress value={evaluation.metrics.practicality} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Depth</span>
                      <span>{Math.round(evaluation.metrics.depth)}%</span>
                    </div>
                    <Progress value={evaluation.metrics.depth} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Human Edge</span>
                      <span>{Math.round(evaluation.metrics.humanEdge)}%</span>
                    </div>
                    <Progress value={evaluation.metrics.humanEdge} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Overall</span>
                      <span>{Math.round(evaluation.metrics.overall)}%</span>
                    </div>
                    <Progress value={evaluation.metrics.overall} className="h-3 bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Feedback</h3>
                  
                  <div className="border p-4 rounded-lg bg-white dark:bg-gray-800">
                    {evaluation.feedback.map((feedback, index) => (
                      <p key={index} className="mb-2 text-gray-800 dark:text-gray-200">
                        {feedback}
                      </p>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-lg mt-4">Comparison with AI</h3>
                  <div className="border p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <div className="flex justify-between items-center mb-2">
                      <span>Your Score</span>
                      <span className="font-bold">{Math.round(evaluation.comparison.userScore)}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span>AI Score</span>
                      <span className="font-bold">{Math.round(evaluation.comparison.rivalScore)}%</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Advantage: </span>
                      {evaluation.comparison.advantage === 'user' ? 'You' : 
                       evaluation.comparison.advantage === 'rival' ? 'AI' : 'Tie'}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 mt-2">
                      {evaluation.comparison.advantageReason}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Your Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-800 dark:text-gray-200">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {evaluation.improvements.map((improvement, index) => (
                      <li key={index} className="text-gray-800 dark:text-gray-200">{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {evaluation.badges.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Badges Earned</h3>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.badges.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                        {badge.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-lg text-green-700 dark:text-green-400 mb-2">
                  Human Edge Profile Generated
                </h3>
                <p className="text-gray-800 dark:text-gray-200">
                  Your responses across all three rounds have been analyzed to create your personalized Human Edge Profile.
                  Continue to see your complete results and insights.
                </p>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleContinue}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            View Your Human Edge Profile
          </Button>
        </CardFooter>
      </Card>
    )}
    
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

export default Round3;
