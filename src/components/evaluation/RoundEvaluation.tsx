'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EvaluationResult } from '@/services/evaluationService';

interface RoundEvaluationProps {
  roundNumber: number;
  evaluation: EvaluationResult;
  onContinue: () => void;
  isLastRound?: boolean;
}

export default function RoundEvaluation({ 
  roundNumber, 
  evaluation, 
  onContinue,
  isLastRound = false
}: RoundEvaluationProps) {
  const { metrics, feedback, strengths, improvements, comparison, badges } = evaluation;
  
  // Format metric value for display
  const formatMetric = (value: number) => {
    return Math.round(value);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-t-4 border-indigo-500">
        <CardHeader className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
          <CardTitle className="text-2xl font-bold">
            Round {roundNumber} Evaluation
          </CardTitle>
          <CardDescription className="text-indigo-100">
            {isLastRound 
              ? "Final assessment of your approach to the challenge" 
              : "Assessment of your approach to the challenge"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-6">
          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
              Performance Metrics
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Creativity</span>
                  <span className="text-sm font-bold">{formatMetric(metrics.creativity)}%</span>
                </div>
                <Progress value={metrics.creativity} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Practicality</span>
                  <span className="text-sm font-bold">{formatMetric(metrics.practicality)}%</span>
                </div>
                <Progress value={metrics.practicality} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Depth</span>
                  <span className="text-sm font-bold">{formatMetric(metrics.depth)}%</span>
                </div>
                <Progress value={metrics.depth} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Human Edge</span>
                  <span className="text-sm font-bold">{formatMetric(metrics.humanEdge)}%</span>
                </div>
                <Progress value={metrics.humanEdge} className="h-2" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Overall Score</span>
                  <span className="text-lg font-bold">{formatMetric(metrics.overall)}%</span>
                </div>
                <Progress value={metrics.overall} className="h-3 bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${metrics.overall}%` }}
                  />
                </Progress>
              </div>
            </div>
          </div>
          
          {/* Feedback */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
              Feedback
            </h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              {feedback.map((item, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {item}
                </p>
              ))}
            </div>
          </div>
          
          {/* Strengths & Improvements */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                Strengths
              </h3>
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* AI Comparison */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
              Comparison with AI Rival
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your Score</span>
                    <span className="text-sm font-bold">{formatMetric(comparison.userScore)}%</span>
                  </div>
                  <Progress value={comparison.userScore} className="h-3 bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${comparison.userScore}%` }}
                    />
                  </Progress>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className={`text-lg font-bold px-3 py-1 rounded ${
                    comparison.advantage === 'user' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : comparison.advantage === 'rival'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {comparison.advantage === 'user' 
                      ? 'You Lead' 
                      : comparison.advantage === 'rival'
                        ? 'AI Leads'
                        : 'Tie'}
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">AI Score</span>
                    <span className="text-sm font-bold">{formatMetric(comparison.rivalScore)}%</span>
                  </div>
                  <Progress value={comparison.rivalScore} className="h-3 bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${comparison.rivalScore}%` }}
                    />
                  </Progress>
                </div>
              </div>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {comparison.advantageReason}
              </p>
            </div>
          </div>
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
                Badges Earned
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {badge.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <Button variant="outline">
            Review Response
          </Button>
          <Button 
            onClick={onContinue}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            {isLastRound ? 'View Results' : `Continue to Round ${roundNumber + 1}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
