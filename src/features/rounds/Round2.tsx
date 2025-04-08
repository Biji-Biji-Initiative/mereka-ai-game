'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/store';
import AIVisualizer from '@/components/ui/ai-visualizer';
import { useSubmitResponse } from '@/services/api/services/challengeService';
import { EvaluationResult, useEvaluateRound } from '@/services/evaluationService';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function Round2() {
  const router = useRouter();
  const [userAnalysis, setUserAnalysis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  // Get game store values and actions using individual selectors for better type safety
  const responses = useGameStore(state => state.responses || {});
  const focus = useGameStore(state => state.focus);
  const saveRound2Response = useGameStore(state => state.saveRound2Response);
  const currentChallenge = useGameStore(state => state.currentChallenge);
  
  // Get evaluation function
  const evaluateRound = useEvaluateRound();
  
  // Check if we have round1 response and focus/challenge
  const round1Data = responses.round1 || {};
  
  // If no round1 data or focus/challenge, redirect to previous step
  useEffect(() => {
    if (!round1Data.userResponse) {
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
      
      // Evaluate the response
      if (currentChallenge && focus) {
        const evaluationResult = await evaluateRound(
          2,
          { userResponse: userAnalysis, aiResponse: currentChallenge.aiResponseForRound2 },
          currentChallenge.description || '',
          focus.id
        );
        
        setEvaluation(evaluationResult);
        
        // Show evaluation after AI thinking animation
        setTimeout(() => {
          setShowAiThinking(false);
          setShowEvaluation(true);
        }, 2000);
      } else {
        // If we can't evaluate, just proceed
        setShowAiThinking(false);
      }
    } catch (error) {
      console.error('Error submitting analysis:', error);
      setShowAiThinking(false); // Stop thinking animation on error
    } finally {
      setIsSubmitting(false);
    }
  }, [userAnalysis, currentChallenge, focus, submitResponseMutation, saveRound2Response, evaluateRound]);
  
  // Handle continuing to next round after evaluation
  const handleContinue = useCallback(() => {
    setShowEvaluation(false);
    // Set game phase to ROUND3
    useGameStore.getState().setGamePhase(useGameStore.getState().GamePhase.ROUND3);
    router.push('/round3');
  }, [router]);
  
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
    {!showEvaluation ? (
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
            {isSubmitting ? 'Submitting...' : 'Submit Analysis'}
          </Button>
        </CardFooter>
      </Card>
    ) : (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Round 2 Evaluation
          </CardTitle>
          <CardDescription>
            Here's how your analysis compares with the AI's approach
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
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleContinue}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            Continue to Round 3
          </Button>
        </CardFooter>
      </Card>
    )}
    
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
