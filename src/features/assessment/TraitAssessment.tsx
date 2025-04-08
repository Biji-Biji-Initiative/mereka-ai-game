'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, GamePhase } from '@/store/useGameStore';
import { useSaveTraitAssessment } from '@/services/api/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Trait } from '@/types/api/index';

// Type for store compatibility
type StoreTrait = {
  id: string;
  name: string;
  description: string;
  value: number;
};

// Personality trait questions - different from AI attitude questions
const traitQuestions = [
  {
    id: 'creativity',
    question: 'How creative do you consider yourself to be?',
    description: 'Your ability to generate novel ideas and solutions.',
    min: 'Not creative',
    max: 'Highly creative'
  },
  {
    id: 'empathy',
    question: 'How empathetic are you toward others?',
    description: 'Your ability to understand and share the feelings of others.',
    min: 'Not empathetic',
    max: 'Highly empathetic'
  },
  {
    id: 'analytical',
    question: 'How analytical is your thinking style?',
    description: 'Your tendency to break down complex problems into components.',
    min: 'Not analytical',
    max: 'Highly analytical'
  },
  {
    id: 'adaptability',
    question: 'How adaptable are you to new situations?',
    description: 'Your ability to adjust to new conditions or environments.',
    min: 'Not adaptable',
    max: 'Highly adaptable'
  },
  {
    id: 'communication',
    question: 'How would you rate your communication skills?',
    description: 'Your ability to convey ideas clearly and effectively.',
    min: 'Basic',
    max: 'Advanced'
  }
];

// Error messages
const ERROR_MESSAGES = {
  NO_USER: 'Please log in to save your assessment.',
  SAVE_ERROR: 'Failed to save your assessment. Please try again.'
};

export default function TraitAssessment() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [traits, setTraits] = useState<Record<string, number>>({});
  const [selectedValue, setSelectedValue] = useState<string>("3");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Get store functions
  const { saveTraits, userInfo, setGamePhase } = useGameStore();
  
  // Initialize mutation for saving traits
  const traitsMutation = useSaveTraitAssessment();
  
  // Calculate progress
  const progress = ((currentQuestion + 1) / traitQuestions.length) * 100;
  
  // Initialize all traits with default values
  useEffect(() => {
    const defaultTraits = traitQuestions.reduce((acc, q) => ({ ...acc, [q.id]: 50 }), {});
    setTraits(defaultTraits);
  }, []);
  
  const handleTabChange = (value: string) => {
    setSelectedValue(value);
  };
  
  const handleNext = () => {
    const question = traitQuestions[currentQuestion];
    const traitValue = parseInt(selectedValue, 10);
    
    // Save current question answer
    setTraits(prev => ({ ...prev, [question.id]: traitValue }));
    
    if (currentQuestion < traitQuestions.length - 1) {
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      
      // Get the stored value for the next question or default to 3
      const nextQuestion = traitQuestions[currentQuestion + 1];
      const nextValue = traits[nextQuestion.id]?.toString() || "3";
      setSelectedValue(nextValue);
    } else {
      // We're at the last question, handle completion
      handleComplete(question.id, traitValue);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      
      // Set the value from stored traits
      const prevQuestion = traitQuestions[currentQuestion - 1];
      const prevValue = traits[prevQuestion.id]?.toString() || "3";
      setSelectedValue(prevValue);
    }
  };
  
  const handleComplete = async (finalQuestionId: string, finalValue: number) => {
    // Update the final question value first
    const updatedTraits = { 
      ...traits, 
      [finalQuestionId]: finalValue 
    };
    
    setIsSubmitting(true);
    
    try {
      // Convert traits object to expected format for store
      const storeTraits: StoreTrait[] = Object.entries(updatedTraits).map(([id, value]) => {
        const question = traitQuestions.find(q => q.id === id);
        return {
          id,
          name: question?.question || id,
          description: question?.description || '',
          value,
          lowLabel: question?.min || 'Low',
          highLabel: question?.max || 'High'
        };
      });
      
      // Convert to API format
      const apiTraits: Trait[] = storeTraits.map(trait => ({
        id: trait.id,
        name: trait.name,
        description: trait.description,
        score: trait.value,
        category: 'personality'
      }));
      
      // Save to API if user info available
      if (userInfo?.email) {
        await traitsMutation.mutateAsync({
          userEmail: userInfo.email,
          traits: apiTraits
        });
      }
      
      // Save to store - this will trigger phase change in the store
      // which will be handled by GamePhaseNavigator for navigation
      console.log("Saving personality traits:", storeTraits);
      saveTraits(storeTraits);
      
      // Add transition effect
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    } catch (error) {
      console.error("Error saving traits:", error);
      toast({
        title: "Error",
        description: ERROR_MESSAGES.SAVE_ERROR,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentQ = traitQuestions[currentQuestion];
  
  return (
    <div className={`container max-w-4xl mx-auto px-4 py-8 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Personality Trait Assessment</h1>
        <p className="text-lg text-muted-foreground">Discover your unique human strengths and traits</p>
      </div>
      
      <div className="assessment-progress mb-4">
        <div className="assessment-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {traitQuestions.map((_, index) => (
            <div 
              key={index} 
              className={`round-indicator mx-1 ${
                index < currentQuestion ? 'completed' : 
                index === currentQuestion ? 'active' : ''
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
          <CardTitle className="text-2xl font-bold">Question {currentQuestion + 1}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {currentQ.id.charAt(0).toUpperCase() + currentQ.id.slice(1)} Assessment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="glass p-6 rounded-lg cyberpunk-grid">
            <h3 className="text-xl font-semibold mb-6 neon-text">{currentQ.question}</h3>
            
            <div className="space-y-4">
              <Tabs 
                defaultValue="3" 
                value={selectedValue}
                onValueChange={handleTabChange}
                className="w-full" 
              >
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="1">1</TabsTrigger>
                  <TabsTrigger value="2">2</TabsTrigger>
                  <TabsTrigger value="3">3</TabsTrigger>
                  <TabsTrigger value="4">4</TabsTrigger>
                  <TabsTrigger value="5">5</TabsTrigger>
                </TabsList>
                <div className="flex justify-between mt-2 px-1 text-sm text-muted-foreground">
                  <span>{currentQ.min}</span>
                  <span>{currentQ.max}</span>
                </div>
              </Tabs>
            </div>
          </div>
          
          <div className="data-card p-4 rounded-lg">
            <h4 className="font-medium mb-2">About {currentQ.id}</h4>
            <p className="text-sm text-muted-foreground">
              {currentQ.description}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-border/30">
          <Button 
            variant="glass" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || isSubmitting || isTransitioning}
            className="w-full sm:w-1/3"
          >
            Previous
          </Button>
          
          <Button 
            variant="holographic" 
            onClick={handleNext}
            disabled={isSubmitting || isTransitioning} 
            className="w-full sm:w-1/3"
          >
            {currentQuestion < traitQuestions.length - 1 ? 'Next Question' : 'Complete Assessment'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Your responses help us identify your unique human strengths</p>
      </div>
    </div>
  );
} 