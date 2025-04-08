'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore, GamePhase } from '@/store';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'journey' | 'badges'>('profile');
  
  // Get game store values
  const { 
    personality, 
    userInfo, 
    focus, 
    responses, 
    profile,
    gamePhase
  } = useGameStore(state => ({
    personality: state.personality,
    userInfo: state.userInfo,
    focus: state.focus,
    responses: state.responses,
    profile: state.profile,
    gamePhase: state.gamePhase
  }));
  
  // Check if user has completed all rounds
  const hasCompletedAllRounds = !!responses?.round1?.userResponse && 
                               !!responses?.round2?.userResponse && 
                               !!responses?.round3?.userResponse;
  
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
  
  // Calculate overall metrics from personality traits
  const calculateOverallMetrics = () => {
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
    const creativity = creativityTraits.length > 0 
      ? creativityTraits.reduce((sum, t) => sum + t.value, 0) / creativityTraits.length 
      : 65 + Math.random() * 15;
      
    const practicality = practicalityTraits.length > 0 
      ? practicalityTraits.reduce((sum, t) => sum + t.value, 0) / practicalityTraits.length 
      : 65 + Math.random() * 15;
      
    const depth = depthTraits.length > 0 
      ? depthTraits.reduce((sum, t) => sum + t.value, 0) / depthTraits.length 
      : 65 + Math.random() * 15;
    
    // Human edge is a weighted combination
    const humanEdge = (creativity * 0.4 + practicality * 0.3 + depth * 0.3) + Math.random() * 5;
    
    return {
      creativity,
      practicality,
      depth,
      humanEdge,
      overall: (creativity + practicality + depth + humanEdge) / 4
    };
  };
  
  // Get overall metrics
  const overallMetrics = calculateOverallMetrics();
  
  // Generate badges based on traits and focus
  const generateBadges = () => {
    const badges = [];
    
    // Focus area badge
    if (focus) {
      badges.push({
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
        badges.push({
          name: `${highestTrait.name} Master`,
          description: `Your ${highestTrait.name} is exceptional`,
          type: 'trait'
        });
      }
      
      // Check for balanced traits
      const traitValues = personality.traits.map(t => t.value);
      const maxDiff = Math.max(...traitValues) - Math.min(...traitValues);
      if (maxDiff < 20) {
        badges.push({
          name: 'Well-Rounded',
          description: 'You have a balanced set of traits',
          type: 'special'
        });
      }
    }
    
    // Completion badge
    if (hasCompletedAllRounds) {
      badges.push({
        name: 'Challenge Completer',
        description: 'You completed all three challenge rounds',
        type: 'achievement'
      });
    }
    
    // Add some random badges for variety
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
    
    // Add 1-2 random badges
    const numRandomBadges = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numRandomBadges; i++) {
      badges.push(randomBadges[i]);
    }
    
    return badges;
  };
  
  // Get badges
  const badges = generateBadges();
  
  // Generate insights based on traits, focus, and responses
  const generateInsights = () => {
    if (!personality?.traits?.length || !focus) return [];
    
    const insights = [];
    
    // Focus-based insight
    insights.push(`Your focus on ${focus.name} aligns well with your personality traits, particularly your ${personality.traits[0]?.name}.`);
    
    // Response-based insights
    if (responses?.round1?.userResponse) {
      insights.push('Your initial approach to challenges shows a preference for creative problem-solving.');
    }
    
    if (responses?.round2?.userResponse) {
      insights.push('When comparing your approach with AI, you demonstrated a strong ability to identify uniquely human perspectives.');
    }
    
    if (responses?.round3?.userResponse) {
      insights.push('Your final response showcased how you integrate multiple perspectives to create comprehensive solutions.');
    }
    
    // Add a general insight
    insights.push('Your human edge is most evident in situations requiring empathy, creativity, and contextual understanding.');
    
    return insights;
  };
  
  // Get insights
  const insights = generateInsights();
  
  // Generate recommendations based on traits and focus
  const generateRecommendations = () => {
    if (!personality?.traits?.length || !focus) return [];
    
    const recommendations = [];
    
    // Focus-based recommendation
    recommendations.push(`Continue developing your expertise in ${focus.name} by seeking out complex problems that require human judgment.`);
    
    // Trait-based recommendations
    const lowestTrait = [...personality.traits].sort((a, b) => a.value - b.value)[0];
    if (lowestTrait) {
      recommendations.push(`Consider opportunities to strengthen your ${lowestTrait.name} through targeted practice and feedback.`);
    }
    
    // General recommendations
    recommendations.push('Regularly compare your approaches with AI tools to identify and leverage your unique human advantages.');
    recommendations.push('Seek out collaborative projects where human and AI capabilities can complement each other.');
    
    return recommendations;
  };
  
  // Get recommendations
  const recommendations = generateRecommendations();
  
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
                    <div className="border p-3 rounded-lg bg-white dark:bg-gray-800">
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        {responses?.round1?.userResponse || "No response recorded"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">2</div>
                    <h4 className="font-medium text-lg text-indigo-700 dark:text-indigo-300">Round 2: Comparing with AI</h4>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 mb-3">
                      You analyzed the differences between your approach and the AI's.
                    </p>
                    <div className="border p-3 rounded-lg bg-white dark:bg-gray-800">
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        {responses?.round2?.userResponse || "No response recorded"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">3</div>
                    <h4 className="font-medium text-lg text-indigo-700 dark:text-indigo-300">Round 3: Final Challenge</h4>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 mb-3">
                      You demonstrated your human edge in a final challenge.
                    </p>
                    <div className="border p-3 rounded-lg bg-white dark:bg-gray-800">
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        {responses?.round3?.userResponse || "No response recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Your Growth</h3>
                <div className="border p-4 rounded-lg bg-white dark:bg-gray-800">
                  <p className="text-gray-800 dark:text-gray-200">
                    Throughout this challenge, you've explored your unique human capabilities and how they complement AI.
                    Your responses show growth in understanding the distinctive value you bring as a human in your focus area.
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 mt-3">
                    Continue to develop your human edge by seeking out complex problems that require the creativity,
                    empathy, and contextual understanding that humans excel at.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Your Earned Badges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <div key={index} className="border p-4 rounded-lg bg-white dark:bg-gray-800 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-3">
                      <span className="text-2xl text-indigo-600 dark:text-indigo-400">
                        {badge.type === 'focus' ? '🎯' : 
                         badge.type === 'trait' ? '🌟' : 
                         badge.type === 'special' ? '✨' : 
                         badge.type === 'achievement' ? '🏆' : '🧠'}
                      </span>
                    </div>
                    <h4 className="font-medium text-indigo-700 dark:text-indigo-300">{badge.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{badge.description}</p>
                    <Badge variant="outline" className="mt-2">{badge.type}</Badge>
                  </div>
                ))}
              </div>
              
              {badges.length > 0 && (
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200">
                    You've earned {badges.length} badges! Continue exploring your human edge to unlock more.
                  </p>
                </div>
              )}
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
              // Reset game and go to welcome page
              useGameStore.getState().resetGame();
              router.push('/');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            Start New Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
