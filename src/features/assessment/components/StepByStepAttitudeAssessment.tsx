"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const attitudeQuestions = [
  {
    id: 1,
    question: "How do you feel about AI's role in creative fields?",
    description: "AI's involvement in art, music, writing, and other creative domains",
    options: [
      { value: 1, label: "Very concerned" },
      { value: 2, label: "Somewhat concerned" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Somewhat positive" },
      { value: 5, label: "Very positive" }
    ]
  },
  {
    id: 2,
    question: "How do you feel about AI's impact on jobs?",
    description: "AI's potential to automate tasks and change employment",
    options: [
      { value: 1, label: "Very concerned" },
      { value: 2, label: "Somewhat concerned" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Somewhat positive" },
      { value: 5, label: "Very positive" }
    ]
  },
  {
    id: 3,
    question: "How do you feel about AI's role in decision-making?",
    description: "AI systems making or assisting with important decisions",
    options: [
      { value: 1, label: "Very concerned" },
      { value: 2, label: "Somewhat concerned" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Somewhat positive" },
      { value: 5, label: "Very positive" }
    ]
  },
  {
    id: 4,
    question: "How do you feel about AI's impact on privacy?",
    description: "AI systems collecting and analyzing personal data",
    options: [
      { value: 1, label: "Very concerned" },
      { value: 2, label: "Somewhat concerned" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Somewhat positive" },
      { value: 5, label: "Very positive" }
    ]
  },
  {
    id: 5,
    question: "How do you feel about the pace of AI development?",
    description: "The speed at which AI technology is advancing",
    options: [
      { value: 1, label: "Too fast" },
      { value: 2, label: "Somewhat fast" },
      { value: 3, label: "Just right" },
      { value: 4, label: "Somewhat slow" },
      { value: 5, label: "Too slow" }
    ]
  }
];

export function StepByStepAttitudeAssessment() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Initialize with default values for all questions to reduce friction
  const [answers, setAnswers] = useState<Record<number, number>>({
    1: 3, // Default to "Neutral" for all questions
    2: 3,
    3: 3,
    4: 3,
    5: 3
  });
  
  // Use saveAttitudes from the game store
  const saveAttitudes = useGameStore(state => state.saveAttitudes);
  
  const currentQuestion = attitudeQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / attitudeQuestions.length) * 100;
  
  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < attitudeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate scores using the preselected values if not explicitly set
      const attitudeScores = {
        creativity: answers[1],
        jobs: answers[2],
        decisions: answers[3],
        privacy: answers[4],
        development: answers[5]
      };
      
      // Convert to AiAttitude array format expected by saveAttitudes
      const aiAttitudes = [
        { 
          id: '1', 
          attitude: 'creativity', 
          strength: attitudeScores.creativity, 
          description: 'AI in creative fields',
          lowLabel: 'Very concerned',
          highLabel: 'Very positive'
        },
        { 
          id: '2', 
          attitude: 'jobs', 
          strength: attitudeScores.jobs, 
          description: 'AI impact on jobs',
          lowLabel: 'Very concerned',
          highLabel: 'Very positive'
        },
        { 
          id: '3', 
          attitude: 'decisions', 
          strength: attitudeScores.decisions, 
          description: 'AI in decision-making',
          lowLabel: 'Very concerned',
          highLabel: 'Very positive'
        },
        { 
          id: '4', 
          attitude: 'privacy', 
          strength: attitudeScores.privacy, 
          description: 'AI impact on privacy',
          lowLabel: 'Very concerned',
          highLabel: 'Very positive'
        },
        { 
          id: '5', 
          attitude: 'development', 
          strength: attitudeScores.development, 
          description: 'Pace of AI development',
          lowLabel: 'Too fast',
          highLabel: 'Too slow'
        }
      ];
      
      try {
        // Save attitudes to the game store - this will trigger phase change in the store
        // which will be handled by GamePhaseNavigator for navigation
        saveAttitudes(aiAttitudes);
        
        // Add to console for debugging
        console.log('Attitudes saved successfully:', aiAttitudes);
        
        // No direct navigation - let the GamePhaseNavigator handle it
        // The saveAttitudes function in useGameStore will update the gamePhase
        // which will trigger the GamePhaseNavigator to handle navigation
      } catch (error) {
        console.error('Error saving attitudes:', error);
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">AI Attitude Assessment</h1>
        <p className="text-lg text-muted-foreground">Help us understand your perspective on artificial intelligence</p>
      </div>
      
      <div className="assessment-progress mb-4">
        <div className="assessment-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {attitudeQuestions.map((_, index) => (
            <div 
              key={index}
              onClick={() => handleQuestionSelect(index)}
              className={`round-indicator mx-1 cursor-pointer ${
                index < currentQuestionIndex ? 'completed' : 
                index === currentQuestionIndex ? 'active' : ''
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <span className="text-sm font-medium neon-text">{Math.round(progress)}% Complete</span>
      </div>
      
      <Card className="challenge-card w-full">
        <CardHeader className="text-center border-b border-border/30 pb-4">
          <CardTitle className="text-2xl font-bold">Question {currentQuestionIndex + 1}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {currentQuestion.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="glass p-6 rounded-lg cyberpunk-grid">
            <h3 className="text-xl font-semibold mb-6 neon-text">{currentQuestion.question}</h3>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`p-4 border rounded-md text-center hover:bg-gray-100 transition-all ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-glow'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <div className="text-xl font-bold mb-2">{option.value}</div>
                  <div className="text-sm">{option.label}</div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-between mt-2 px-1 text-sm text-muted-foreground">
              <span>{currentQuestion.options[0].label}</span>
              <span>{currentQuestion.options[currentQuestion.options.length - 1].label}</span>
            </div>
          </div>
          
          <div className="data-card p-4 rounded-lg">
            <h4 className="font-medium mb-2">About this question</h4>
            <p className="text-sm text-muted-foreground">
              Your response helps us understand your perspective on {currentQuestion.description.toLowerCase()}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-border/30">
          <Button 
            variant="glass" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-1/3"
          >
            Previous
          </Button>
          
          <Button 
            variant="holographic" 
            onClick={handleNext}
            className="w-full sm:w-1/3"
          >
            {currentQuestionIndex < attitudeQuestions.length - 1
              ? 'Next Question'
              : 'Complete Assessment'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Your responses help us identify your unique human strengths</p>
      </div>
    </div>
  );
}
