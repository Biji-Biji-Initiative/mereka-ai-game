import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore, FocusArea } from '@/store/useGameStore';
import { useGameLogger } from '@/hooks/useGameLogger';
import { GamePhase } from '@/store/useGameStore';

// Sample focus areas
const focusAreas = [
  {
    id: 'creative',
    name: 'Creative Thinking',
    description: 'Test your creative problem-solving abilities against AI systems.',
    icon: '🎨',
    color: 'var(--ai-purple)',
  },
  {
    id: 'analytical',
    name: 'Analytical Reasoning',
    description: 'Challenge your logical and analytical skills in AI-driven scenarios.',
    icon: '🧠',
    color: 'var(--ai-blue)',
  },
  {
    id: 'emotional',
    name: 'Emotional Intelligence',
    description: 'Explore how your emotional intelligence compares to AI capabilities.',
    icon: '❤️',
    color: 'var(--ai-red)',
  },
  {
    id: 'ethical',
    name: 'Ethical Decision Making',
    description: 'Navigate complex ethical dilemmas that test both human and AI judgment.',
    icon: '⚖️',
    color: 'var(--ai-green)',
  },
];

export function Focus() {
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const saveFocus = useGameStore(state => state.saveFocus);
  const setGamePhase = useGameStore(state => state.setGamePhase);
  const { logGameEvent, logUserInteraction } = useGameLogger('FocusComponent');
  
  // Log component mount
  useEffect(() => {
    logGameEvent('focus_selection_started', {
      availableFocusAreas: focusAreas.map(f => f.name)
    });
  }, [logGameEvent]);
  
  const handleSelect = (id: string) => {
    setSelectedFocus(id);
    logUserInteraction('focus_area_selected', { 
      focusId: id,
      focusName: focusAreas.find(f => f.id === id)?.name
    });
  };
  
  const handleContinue = () => {
    if (selectedFocus) {
      const focus = focusAreas.find(f => f.id === selectedFocus);
      if (focus) {
        setIsTransitioning(true);
        
        // Create a FocusArea object from the selected focus
        const focusArea: FocusArea = {
          id: focus.id,
          name: focus.name,
          description: focus.description,
          matchLevel: 100 // Default match level
        };
        
        // Save focus to game store
        saveFocus(focusArea);
        
        logGameEvent('focus_selection_completed', {
          selectedFocus: {
            id: focus.id,
            name: focus.name
          }
        });
        
        // Navigation will be handled by GamePhaseNavigator
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }
    }
  };
  
  return (
    <div className={`container max-w-4xl mx-auto px-4 py-8 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold neon-text mb-2">Choose Your Focus</h1>
        <p className="text-xl text-gradient">Select the area where your human abilities will challenge AI</p>
      </div>
      
      <Card className="challenge-card w-full">
        <CardHeader className="text-center border-b border-border/30 pb-4">
          <CardTitle className="text-2xl font-bold">Focus Selection</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your choice will determine the type of challenges you'll face
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {focusAreas.map((focus) => (
              <div 
                key={focus.id}
                className={`focus-area ${selectedFocus === focus.id ? 'selected' : ''}`}
                onClick={() => handleSelect(focus.id)}
                role="button"
                aria-pressed={selectedFocus === focus.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelect(focus.id);
                  }
                }}
                style={{
                  '--focus-color': focus.color
                } as React.CSSProperties}
              >
                <div className="flex items-center mb-3">
                  <span className="text-4xl mr-4 animate-float">{focus.icon}</span>
                  <h3 className={`text-xl font-semibold ${selectedFocus === focus.id ? 'neon-text' : ''}`}>
                    {focus.name}
                  </h3>
                </div>
                <p className="text-muted-foreground">{focus.description}</p>
                
                {selectedFocus === focus.id && (
                  <div className="mt-4 p-3 glass rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Challenge Focus:</span> Your {focus.name.toLowerCase()} will be tested through specialized AI challenges designed to measure human capabilities.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-border/30">
          <Button 
            variant="holographic" 
            size="lg" 
            onClick={handleContinue}
            disabled={!selectedFocus || isTransitioning}
            className="w-full sm:w-auto"
          >
            Begin {selectedFocus ? focusAreas.find(f => f.id === selectedFocus)?.name : 'Challenge'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Each focus area tests different aspects of human-AI interaction</p>
      </div>
    </div>
  );
}
