"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import { useGameLogger } from '@/hooks/useGameLogger';

export function Welcome() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  
  // Get store actions
  const setGamePhase = useGameStore(state => state.setGamePhase);
  const resetGame = useGameStore(state => state.resetGame);
  const { logGameEvent, logUserInteraction } = useGameLogger('WelcomeComponent');
  
  // Log component mount when the component loads
  useEffect(() => {
    // Don't automatically reset on component mount - this caused an infinite loop!
    // resetGame();
    
    logGameEvent('game_started', {
      timestamp: new Date(),
      environment: process.env.NODE_ENV
    });
  }, [logGameEvent]);
  
  const handleStart = () => {
    logUserInteraction('start_button_clicked');
    
    // Add transition effect
    setIsTransitioning(true);
    
    // Update game state - go to CONTEXT first
    setGamePhase(GamePhase.CONTEXT);
    
    // Log event
    logGameEvent('welcome_completed');
    
    // Don't navigate manually - GamePhaseNavigator will handle it
    // Just add a delay for the visual transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };
  
  return (
    <div className={`container max-w-4xl mx-auto px-4 py-8 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold neon-text animate-float mb-2">AI Fight Club</h1>
        <p className="text-xl text-gradient">Discover Your Competitive Edge in the Age of AI</p>
      </div>
      
      <Card className="ai-card w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gradient animate-float">Welcome, Challenger</CardTitle>
          <CardDescription className="text-lg mt-2">
            Discover your AI personality traits and challenge the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="glass p-6 rounded-lg cyberpunk-grid">
            <h3 className="text-xl font-semibold mb-3 glow-text">How It Works</h3>
            <ol className="list-decimal list-inside space-y-3">
              <li className="flex items-start">
                <span className="round-indicator mr-3 flex-shrink-0 completed">1</span>
                <span>Complete a short personality assessment to discover your AI traits</span>
              </li>
              <li className="flex items-start">
                <span className="round-indicator mr-3 flex-shrink-0">2</span>
                <span>Choose your focus area for the challenge based on your strengths</span>
              </li>
              <li className="flex items-start">
                <span className="round-indicator mr-3 flex-shrink-0">3</span>
                <span>Compete in three rounds against the AI to test your abilities</span>
              </li>
              <li className="flex items-start">
                <span className="round-indicator mr-3 flex-shrink-0">4</span>
                <span>Receive your personalized AI profile with detailed insights</span>
              </li>
              <li className="flex items-start">
                <span className="round-indicator mr-3 flex-shrink-0">5</span>
                <span>Share your results and compare with others in the community</span>
              </li>
            </ol>
          </div>
          
          <div className="challenge-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 neon-text">What You'll Discover</h3>
            <p className="mb-4">
              AI Fight Club helps you understand how your personality traits might be interpreted
              by artificial intelligence systems. Through a series of challenges, you'll learn:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="data-card p-4 rounded-lg">
                <h4 className="font-medium mb-2">AI Personality Traits</h4>
                <p className="text-sm text-muted-foreground">Discover how AI systems perceive your unique characteristics</p>
              </div>
              <div className="data-card p-4 rounded-lg">
                <h4 className="font-medium mb-2">Communication Style</h4>
                <p className="text-sm text-muted-foreground">Learn how your communication patterns interact with AI</p>
              </div>
              <div className="data-card p-4 rounded-lg">
                <h4 className="font-medium mb-2">Improvement Strategies</h4>
                <p className="text-sm text-muted-foreground">Get personalized tips to enhance your AI interactions</p>
              </div>
              <div className="data-card p-4 rounded-lg">
                <h4 className="font-medium mb-2">Unique AI Persona</h4>
                <p className="text-sm text-muted-foreground">Receive a profile representing your AI-facing identity</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            variant="holographic" 
            size="lg" 
            onClick={handleStart} 
            disabled={isTransitioning}
            className="w-full sm:w-auto text-lg font-medium"
          >
            Start Your Journey
          </Button>
          <Button
            variant="neon"
            size="lg"
            onClick={() => window.open('https://aifightclub.com/about', '_blank')}
            className="w-full sm:w-auto"
          >
            Learn More
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset the game state but don't redirect
              resetGame();
              // Set the phase explicitly to WELCOME
              setGamePhase(GamePhase.WELCOME);
            }}
            className="absolute top-4 right-4"
          >
            Reset Game
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>AI Fight Club © 2025 | Your data is secure and never shared with third parties</p>
      </div>
    </div>
  );
}
