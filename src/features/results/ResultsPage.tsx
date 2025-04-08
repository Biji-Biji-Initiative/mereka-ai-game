'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore, GamePhase } from '@/store';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'journey' | 'badges'>('profile');
  
  // Get game store values with individual selectors to prevent unnecessary re-renders
  const personality = useGameStore(state => state.personality);
  const userInfo = useGameStore(state => state.userInfo);
  const focus = useGameStore(state => state.focus);
  const responses = useGameStore(state => state.responses);
  const profile = useGameStore(state => state.profile);
  const gamePhase = useGameStore(state => state.gamePhase);
  
  // Check if user has completed all rounds
  const hasCompletedAllRounds = useMemo(() => {
    return !!responses?.round1?.userResponse && 
           !!responses?.round2?.userResponse && 
           !!responses?.round3?.userResponse;
  }, [responses]);
  
  // Redirect if essential data is missing
  useEffect(() => {
    if (!hasCompletedAllRounds) {
      console.warn('Not all rounds completed, redirecting to appropriate round');
      if (!responses?.round1?.userResponse) {
        router.push('/round1');
      } else if (!responses?.round2?.userResponse) {
        router.push('/round2');
      } else if (!responses?.round3?.userResponse) {
        router.push('/round3');
      }
      return;
    }
    
    if (!focus) {
      console.warn('Missing focus, redirecting to focus page');
      router.push('/focus');
      return;
    }
  }, [hasCompletedAllRounds, focus, responses, router]);
  
  // If we don't have profile data yet, show loading
  if (!profile && hasCompletedAllRounds) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-600 dark:text-gray-300">
          Generating your Human Edge Profile...
        </div>
      </div>
    );
  }
  
  // Calculate overall metrics from personality traits - memoized to prevent recalculation on every render
  const overallMetrics = useMemo(() => {
    if (!personality?.traits?.length) return null;
    
    // Map traits to metrics categories
    const creativityTraits = personality.traits.filter(t => 
      t.name.toLowerCase().includes('creative') || 
      t.name.toLowerCase().includes('imagination') ||
      t.name.toLowerCase().includes('innovative')
    );
    
    const practicalityTraits = personality.traits.filter(t => 
      t.name.toLowerCase().includes('practical') || 
      t.name.toLowerCase().includes('organized') ||
      t.name.toLowerCase().includes('detail')
    );
    
    const depthTraits = personality.traits.filter(t => 
      t.name.toLowerCase().includes('analytical') || 
      t.name.toLowerCase().includes('deep') ||
      t.name.toLowerCase().includes('complex')
    );
    
    // Calculate averages (or use default if no traits match)
    // Use fixed seed for random values to ensure consistency between renders
    const randomSeed = personality.traits.reduce((sum, t) => sum + t.value, 0);
    const getRandomValue = (base: number) => base + ((randomSeed % 100) / 100) * 15;
    
    const creativity = creativityTraits.length > 0 
      ? creativityTraits.reduce((sum, t) => sum + t.value, 0) / creativityTraits.length 
      : getRandomValue(65);
      
    const practicality = practicalityTraits.length > 0 
      ? practicalityTraits.reduce((sum, t) => sum + t.value, 0) / practicalityTraits.length 
      : getRandomValue(65);
      
    const depth = depthTraits.length > 0 
      ? depthTraits.reduce((sum, t) => sum + t.value, 0) / depthTraits.length 
      : getRandomValue(65);
    
    // Human edge is a weighted combination
    const humanEdge = (creativity * 0.4 + practicality * 0.3 + depth * 0.3) + ((randomSeed % 100) / 100) * 5;
    
    return {
      creativity,
      practicality,
      depth,
      humanEdge,
      overall: (creativity + practicality + depth + humanEdge) / 4
    };
  }, [personality]);
  
  // Generate badges based on traits and focus - memoized to prevent recalculation on every render
  const badges = useMemo(() => {
    const badgesList = [];
    
    // Focus area badge
    if (focus) {
      badgesList.push({
        name: `${focus.name} Specialist`,
        description: `You've demonstrated expertise in ${focus.name}`,
        type: 'focus'
      });
    }
    
    // Trait-based badges
    if (personality?.traits?.length) {
      // Find highest trait
      const highestTrait = [...personality.traits].sort((a, b) => b.value - a.value)[0];
      if (highestTrait && highestTrait.value > 70) {
        badgesList.push({
          name: `${highestTrait.name} Master`,
          description: `Your ${highestTrait.name} is exceptional`,
          type: 'trait'
        });
      }
      
      // Check for balanced traits
      const traitValues = personality.traits.map(t => t.value);
      const maxDiff = Math.max(...traitValues) - Math.min(...traitValues);
      if (maxDiff < 20) {
        badgesList.push({
          name: 'Well-Rounded',
          description: 'You have a balanced set of traits',
          type: 'special'
        });
      }
    }
    
    // Completion badge
    if (hasCompletedAllRounds) {
      badgesList.push({
        name: 'Challenge Completer',
        description: 'You completed all three challenge rounds',
        type: 'achievement'
      });
    }
    
    // Add some random badges for variety - use a deterministic approach
    const randomBadges = [
      {
        name: 'Creative Thinker',
        description: 'You demonstrated exceptional creative thinking',
        type: 'skill'
      },
      {
        name: 'Human Edge Champion',
        description: 'Your responses showcased strong human advantages',
        type: 'special'
      },
      {
        name: 'Deep Analyzer',
        description: 'You showed remarkable depth in your analysis',
        type: 'skill'
      }
    ];
    
    // Use a deterministic approach to select badges
    const seed = personality?.traits?.length ? 
      personality.traits.reduce((sum, t) => sum + t.value, 0) : 
      (focus?.matchLevel || 50);
    
    // Add 1-2 random badges based on seed
    const numRandomBadges = 1 + (seed % 2);
    for (let i = 0; i < numRandomBadges && i < randomBadges.length; i++) {
      badgesList.push(randomBadges[i]);
    }
    
    return badgesList;
  }, [focus, personality, hasCompletedAllRounds]);
  
  // Generate insights based on traits, focus, and responses - memoized to prevent recalculation on every render
  const insights = useMemo(() => {
    if (!personality?.traits?.length || !focus) return [];
    
    const insightsList = [];
    
    // Focus-based insight
    if (personality.traits[0]) {
      insightsList.push(`Your focus on ${focus.name} aligns well with your personality traits, particularly your ${personality.traits[0]?.name}.`);
    }
    
    // Response-based insights
    if (responses?.round1?.userResponse) {
      insightsList.push('Your initial approach to challenges shows a preference for creative problem-solving.');
    }
    
    if (responses?.round2?.userResponse) {
      insightsList.push('When comparing your approach with AI, you demonstrated a strong ability to identify uniquely human perspectives.');
    }
    
    if (responses?.round3?.userResponse) {
      insightsList.push('Your final response showcased how you integrate multiple perspectives to create comprehensive solutions.');
    }
    
    // Add a general insight
    insightsList.push('Your human edge is most evident in situations requiring empathy, creativity, and contextual understanding.');
    
    return insightsList;
  }, [personality, focus, responses]);
  
  // Generate recommendations based on traits and focus - memoized to prevent recalculation on every render
  const recommendations = useMemo(() => {
    if (!personality?.traits?.length || !focus) return [];
    
    const recommendationsList = [];
    
    // Focus-based recommendation
    recommendationsList.push(`Continue developing your expertise in ${focus.name} by seeking out complex problems that require human judgment.`);
    
    // Trait-based recommendations
    if (personality.traits.length > 0) {
      const lowestTrait = [...personality.traits].sort((a, b) => a.value - b.value)[0];
      if (lowestTrait) {
        recommendationsList.push(`Consider opportunities to strengthen your ${lowestTrait.name} through targeted practice and feedback.`);
      }
    }
    
    // General recommendations
    recommendationsList.push('Regularly compare your approaches with AI tools to identify and leverage your unique human advantages.');
    recommendationsList.push('Seek out collaborative projects where human and AI capabilities can complement each other.');
    
    return recommendationsList;
  }, [personality, focus]);
  
  return (
    <div className="space-y-8 pb-16">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Your Human Edge Profile
          </CardTitle>
          <CardDescription>
            Based on your responses across all three challenge rounds
          </CardDescription>
          
          {/* Tab Navigation */}
          <div className="flex border-b mt-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'journey' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('journey')}
            >
              Your Journey
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'badges' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('badges')}
            >
              Badges
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Your Human Edge</h3>
                  
                  {overallMetrics && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Creativity</span>
                          <span>{Math.round(overallMetrics.creativity)}%</span>
                        </div>
                        <Progress value={overallMetrics.creativity} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Practicality</span>
                          <span>{Math.round(overallMetrics.practicality)}%</span>
                        </div>
                        <Progress value={overallMetrics.practicality} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Depth</span>
                          <span>{Math.round(overallMetrics.depth)}%</span>
                        </div>
                        <Progress value={overallMetrics.depth} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Human Edge</span>
                          <span>{Math.round(overallMetrics.humanEdge)}%</span>
                        </div>
                        <Progress value={overallMetrics.humanEdge} className="h-2" />
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3">Focus Area</h3>
                    {focus && (
                      <div className="border p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                        <h4 className="font-medium text-indigo-700 dark:text-indigo-300">{focus.name}</h4>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{focus.description}</p>
                        <div className="mt-2 flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Match Level:</span>
                          <Progress value={focus.matchLevel} className="h-2 w-24" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{focus.matchLevel}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4">Key Insights</h3>
                  <div className="border p-4 rounded-lg bg-white dark:bg-gray-800 space-y-3">
                    {insights.map((insight, index) => (
                      <p key={index} className="text-gray-800 dark:text-gray-200">
                        {insight}
                      </p>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-lg mt-6 mb-3">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {recommendations.map((recommendation, index) => (
                      <li key={index} className="text-gray-800 dark:text-gray-200">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Personality Traits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {personality?.traits?.map((trait, index) => (
                    <div key={index} className="border p-4 rounded-lg bg-white dark:bg-gray-800">
                      <h4 className="font-medium text-indigo-700 dark:text-indigo-300">{trait.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{trait.description}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{trait.lowLabel}</span>
                        <Progress value={trait.value} className="h-1.5 flex-grow" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{trait.highLabel}</span>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-sm font-medium">{trait.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Journey Tab */}
          {activeTab === 'journey' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Your Challenge Journey</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-800"></div>
                  
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">1</div>
                    <h4 className="font-medium text-lg text-indigo-700 dark:text-indigo-300">Round 1: Initial Challenge</h4>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 mb-3">
                      You approached the challenge with your unique human perspective.
                    </p>
                    <div className="border p-4 rounded-lg bg-white dark:bg-gray-800">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Your Response:</h5>
                      <p className="text-gray-700 dark:text-gray-300">
                        {responses?.round1?.userResponse || "No response recorded"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">2</div>
                    <h4 className="font-medium text-lg text-indigo-700 dark:text-indigo-300">Round 2: AI Comparison</h4>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 mb-3">
                      You compared your approach with how AI would handle the challenge.
                    </p>
                    <div className="border p-4 rounded-lg bg-white dark:bg-gray-800">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Your Analysis:</h5>
                      <p className="text-gray-700 dark:text-gray-300">
                        {responses?.round2?.userResponse || "No response recorded"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">3</div>
                    <h4 className="font-medium text-lg text-indigo-700 dark:text-indigo-300">Round 3: Final Challenge</h4>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 mb-3">
                      You demonstrated your human edge in the final challenge.
                    </p>
                    <div className="border p-4 rounded-lg bg-white dark:bg-gray-800">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Your Response:</h5>
                      <p className="text-gray-700 dark:text-gray-300">
                        {responses?.round3?.userResponse || "No response recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Your Growth</h3>
                <div className="border p-4 rounded-lg bg-white dark:bg-gray-800">
                  <p className="text-gray-700 dark:text-gray-300">
                    Throughout this challenge, you've developed a deeper understanding of your human edge in the context of AI. 
                    Your responses show growth in recognizing the unique value you bring as a human in your focus area.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Your Earned Badges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((badge, index) => (
                  <div key={index} className="border p-4 rounded-lg bg-white dark:bg-gray-800 flex items-start">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-700 dark:text-indigo-300">{badge.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{badge.description}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300">
                          {badge.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-300 mb-2">
                  Continue Your Journey
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Complete more challenges to earn additional badges and further develop your human edge profile.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/round3')}
          >
            Back to Round 3
          </Button>
          <Button 
            onClick={() => {
              const resetGame = useGameStore.getState().resetGame;
              resetGame();
              router.push('/');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            Start New Challenge
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
