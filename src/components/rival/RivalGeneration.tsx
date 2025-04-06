import React, { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useRivalStore } from '@/store/rival-store';
import { RivalCard } from '@/components/rival/RivalCard';
import { Button } from '@/components/ui/button';

interface RivalGenerationProps {
  onGenerated?: () => void;
}

export function RivalGeneration({ onGenerated }: RivalGenerationProps) {
  const { personality, focus } = useGameStore(state => ({
    personality: state.personality,
    focus: state.focus
  }));

  const traits = personality?.traits || [];
  
  const currentRival = useRivalStore(state => state.currentRival);
  const generateNewRival = useRivalStore(state => state.generateNewRival);
  const preferredRivalryStyle = useRivalStore(state => state.preferredRivalryStyle);
  const preferredDifficulty = useRivalStore(state => state.preferredDifficulty);
  const setPreferredRivalryStyle = useRivalStore(state => state.setPreferredRivalryStyle);
  const setPreferredDifficulty = useRivalStore(state => state.setPreferredDifficulty);
  
  // Generate rival when traits are available and no rival exists yet
  useEffect(() => {
    if (traits.length > 0 && !currentRival) {
      handleGenerateRival();
    }
  }, [traits, currentRival]);
  
  const handleGenerateRival = () => {
    if (traits.length === 0) return;
    
    generateNewRival({
      userTraits: traits.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        value: t.value
      })),
      focusArea: focus?.id,
      difficultyLevel: preferredDifficulty,
      rivalryStyle: preferredRivalryStyle
    });
    
    if (onGenerated) {
      onGenerated();
    }
  };
  
  const handleRivalryStyleChange = (style: 'friendly' | 'competitive' | 'intense') => {
    setPreferredRivalryStyle(style);
    
    // Regenerate rival with new style if one already exists
    if (currentRival && traits.length > 0) {
      generateNewRival({
        userTraits: traits.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          value: t.value
        })),
        focusArea: focus?.id,
        difficultyLevel: preferredDifficulty,
        rivalryStyle: style
      });
    }
  };
  
  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setPreferredDifficulty(difficulty);
    
    // Regenerate rival with new difficulty if one already exists
    if (currentRival && traits.length > 0) {
      generateNewRival({
        userTraits: traits.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          value: t.value
        })),
        focusArea: focus?.id,
        difficultyLevel: difficulty,
        rivalryStyle: preferredRivalryStyle
      });
    }
  };
  
  if (!traits.length) {
    return (
      <div className="text-center p-6">
        <p>Complete the assessment to generate your AI rival.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {currentRival ? (
        <RivalCard rival={currentRival} showPerformance={true} />
      ) : (
        <div className="text-center p-6 glass rounded-lg">
          <p className="mb-4">Generating your personalized AI rival...</p>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Rivalry Style</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={preferredRivalryStyle === 'friendly' ? 'default' : 'outline'}
              onClick={() => handleRivalryStyleChange('friendly')}
              className="flex-1"
            >
              Friendly
            </Button>
            <Button
              variant={preferredRivalryStyle === 'competitive' ? 'default' : 'outline'}
              onClick={() => handleRivalryStyleChange('competitive')}
              className="flex-1"
            >
              Competitive
            </Button>
            <Button
              variant={preferredRivalryStyle === 'intense' ? 'default' : 'outline'}
              onClick={() => handleRivalryStyleChange('intense')}
              className="flex-1"
            >
              Intense
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Difficulty Level</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={preferredDifficulty === 'easy' ? 'default' : 'outline'}
              onClick={() => handleDifficultyChange('easy')}
              className="flex-1"
            >
              Easy
            </Button>
            <Button
              variant={preferredDifficulty === 'medium' ? 'default' : 'outline'}
              onClick={() => handleDifficultyChange('medium')}
              className="flex-1"
            >
              Medium
            </Button>
            <Button
              variant={preferredDifficulty === 'hard' ? 'default' : 'outline'}
              onClick={() => handleDifficultyChange('hard')}
              className="flex-1"
            >
              Hard
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            variant="holographic"
            onClick={handleGenerateRival}
            disabled={!traits.length}
          >
            Generate New Rival
          </Button>
        </div>
      </div>
    </div>
  );
}
