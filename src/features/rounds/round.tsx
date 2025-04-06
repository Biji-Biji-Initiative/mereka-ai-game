import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import { useGameLogger } from '@/hooks/useGameLogger';
import RoundChallenge from './RoundChallenge';
import RoundResponse from './RoundResponse';

export interface RoundProps {
  roundNumber: number;
  onComplete: () => void;
}

// Sample round challenges
const challenges = {
  1: {
    title: 'Pattern Recognition',
    description: 'Identify patterns that AI might miss due to lack of human intuition.',
    steps: ['Analyze the given patterns', 'Identify the outlier', 'Explain your reasoning'],
    color: 'var(--ai-blue)',
  },
  2: {
    title: 'Creative Problem Solving',
    description: 'Solve problems that require creative thinking beyond algorithmic approaches.',
    steps: ['Understand the problem constraints', 'Generate multiple solutions', 'Select the most innovative approach'],
    color: 'var(--ai-purple)',
  },
  3: {
    title: 'Ethical Dilemma',
    description: 'Navigate complex ethical scenarios where human judgment is crucial.',
    steps: ['Evaluate the ethical implications', 'Consider multiple perspectives', 'Make a balanced decision'],
    color: 'var(--ai-green)',
  },
};

export function Round({ roundNumber, onComplete }: RoundProps) {
  const [step, setStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60); // seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  
  const { setResponses } = useGameStore();
  const { logGameEvent, logUserInteraction, logGameProgress } = useGameLogger('RoundComponent');
  
  const challenge = challenges[roundNumber as keyof typeof challenges];
  const progress = ((step + 1) / challenge.steps.length) * 100;
  
  // Log round start
  useEffect(() => {
    logGameEvent('round_started', {
      roundNumber,
      challengeTitle: challenge.title,
      totalSteps: challenge.steps.length
    });
    
    // Return cleanup function
    return () => {
      if (timeRemaining > 0 && step < challenge.steps.length - 1) {
        logGameEvent('round_abandoned', {
          roundNumber,
          completedSteps: step,
          timeRemaining
        });
      }
    };
  }, [roundNumber, challenge, logGameEvent, step, timeRemaining]);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isTimerRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // Time's up - auto complete with lower score
            logGameEvent('time_expired', { roundNumber });
            setIsTimerRunning(false);
            
            // Complete the round with a lower score due to time expiration
            const timeExpiredScore = Math.floor(Math.random() * 40) + 30; // 30-70 range
            setResponses(prev => ({
              ...prev,
              [`round${roundNumber}`]: {
                ...prev[`round${roundNumber}` as keyof typeof prev],
                userResponse: "Time expired",
                score: timeExpiredScore,
                completed: true,
                timeRemaining: 0,
                timeExpired: true
              }
            }));
            
            onComplete();
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, timeRemaining, roundNumber, setResponses, onComplete, logGameEvent]);
  
  // Log step changes
  useEffect(() => {
    if (step > 0) {
      logGameProgress(`round${roundNumber}_step${step}`, progress, {
        stepName: challenge.steps[step - 1],
        timeRemaining
      });
    }
  }, [step, roundNumber, challenge.steps, progress, timeRemaining, logGameProgress]);
  
  const handleNextStep = () => {
    logUserInteraction('next_step_clicked', {
      roundNumber,
      currentStep: step,
      timeRemaining
    });
    
    if (step < challenge.steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      // Calculate score based on time remaining and steps completed
      const timeBonus = Math.floor(timeRemaining / 60 * 20); // Up to 20 points for time
      const baseScore = Math.floor(Math.random() * 60) + 20; // 20-80 base score
      const finalScore = Math.min(100, baseScore + timeBonus);
      
      // Complete the round
      setResponses(prev => ({
        ...prev,
        [`round${roundNumber}`]: {
          ...prev[`round${roundNumber}` as keyof typeof prev],
          userResponse: "Round completed",
          score: finalScore,
          completed: true,
          timeRemaining,
          timeExpired: false
        }
      }));
      
      logGameEvent('round_completed', {
        roundNumber,
        score: finalScore,
        timeRemaining
      });
      
      onComplete();
    }
  };
  
  const handlePreviousStep = () => {
    logUserInteraction('previous_step_clicked', {
      roundNumber,
      currentStep: step,
      timeRemaining
    });
    
    setStep(prev => Math.max(0, prev - 1));
  };
  
  // Calculate timer progress percentage for visual display
  const timerProgress = (timeRemaining / 60) * 100;
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold neon-text mb-2">Round {roundNumber}</h1>
        <p className="text-xl text-gradient">Challenge: {challenge.title}</p>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {challenge.steps.map((_, index) => (
            <div 
              key={index} 
              className={`round-indicator mx-1 ${
                index < step ? 'completed' : 
                index === step ? 'active' : ''
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        <div className="timer" style={{"--progress": `${timerProgress}%`} as React.CSSProperties}>
          <span className="timer-text">{timeRemaining}</span>
        </div>
      </div>
      
      <Card className="challenge-card w-full">
        <CardHeader className="text-center border-b border-border/30 pb-4">
          <CardTitle className="text-2xl font-bold">{challenge.title}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {challenge.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="assessment-progress mb-4">
            <div className="assessment-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="glass p-6 rounded-lg cyberpunk-grid">
            <h3 className="text-xl font-semibold mb-4 neon-text">Step {step + 1}: {challenge.steps[step]}</h3>
            
            <div className="bg-background/30 backdrop-blur-md p-6 rounded-lg border border-white/10 card-holographic">
              {/* Simulated challenge content - would be replaced with actual challenge UI */}
              <div className="h-48 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent animate-rotate mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <span className="text-xl font-bold">{step + 1}</span>
                  </div>
                </div>
                <p className="text-center text-lg mb-2">Challenge Interface</p>
                <p className="text-center text-muted-foreground">Interactive challenge content would appear here</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 data-card">
              <h4 className="font-medium mb-2">Challenge Hint</h4>
              <p className="text-sm text-muted-foreground">
                {step === 0 && "Look for patterns that might not be immediately obvious. Human intuition can detect subtle connections."}
                {step === 1 && "Consider multiple perspectives. What might seem like an outlier from one angle could be a pattern from another."}
                {step === 2 && "Explain your reasoning clearly. The ability to articulate intuitive leaps is a uniquely human strength."}
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-border/30">
          <Button 
            variant="glass" 
            onClick={handlePreviousStep}
            disabled={step === 0}
            className="w-full sm:w-1/3"
          >
            Previous Step
          </Button>
          
          <Button 
            variant="holographic" 
            onClick={handleNextStep} 
            className="w-full sm:w-1/3"
          >
            {step < challenge.steps.length - 1 ? 'Next Step' : 'Complete Round'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Round {roundNumber} of 3 | Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
      </div>
    </div>
  );
}
