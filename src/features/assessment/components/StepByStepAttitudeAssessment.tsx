"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  // Fix: Use saveAttitudes instead of updateAttitudes
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
      // Calculate average scores
      const attitudeScores = {
        creativity: answers[1] || 3,
        jobs: answers[2] || 3,
        decisions: answers[3] || 3,
        privacy: answers[4] || 3,
        development: answers[5] || 3
      };
      
      // Convert to AiAttitude array format expected by saveAttitudes
      const aiAttitudes = [
        { id: '1', attitude: 'creativity', strength: attitudeScores.creativity, description: 'AI in creative fields' },
        { id: '2', attitude: 'jobs', strength: attitudeScores.jobs, description: 'AI impact on jobs' },
        { id: '3', attitude: 'decisions', strength: attitudeScores.decisions, description: 'AI in decision-making' },
        { id: '4', attitude: 'privacy', strength: attitudeScores.privacy, description: 'AI impact on privacy' },
        { id: '5', attitude: 'development', strength: attitudeScores.development, description: 'Pace of AI development' }
      ];
      
      // Update game state using saveAttitudes instead of updateAttitudes
      saveAttitudes(aiAttitudes);
      
      // Navigate to next phase
      router.push('/focus');
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-2">AI Attitude Assessment</h1>
      <p className="text-center text-gray-600 mb-8">
        Help us understand your perspective on artificial intelligence
      </p>
      
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="text-right mt-1 text-sm text-gray-600">
          {Math.round(progress)}% Complete
        </div>
      </div>
      
      <div className="flex justify-center mb-8">
        {attitudeQuestions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleQuestionSelect(index)}
            className={`w-12 h-12 rounded-full mx-2 flex items-center justify-center ${
              index === currentQuestionIndex
                ? 'bg-blue-500 text-white'
                : index < currentQuestionIndex
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">
            Question {currentQuestionIndex + 1}
          </CardTitle>
          <p className="text-gray-600">
            {currentQuestion.description}
          </p>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>
          
          <div className="grid grid-cols-5 gap-2 mb-8">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`p-4 border rounded-md text-center hover:bg-gray-100 ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="text-xl font-bold mb-2">{option.value}</div>
                <div className="text-sm">{option.label}</div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              {currentQuestionIndex < attitudeQuestions.length - 1
                ? 'Next Question'
                : 'Complete Assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center mt-8 text-gray-600">
        Your responses help us identify your unique human strengths
      </p>
    </div>
  );
}
