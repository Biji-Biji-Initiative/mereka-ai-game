import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Rival } from '@/types/rival';

interface RivalCardProps {
  rival: Rival;
  showPerformance?: boolean;
  showComparison?: boolean;
  className?: string;
}

export function RivalCard({ rival, showPerformance = false, showComparison = false, className = '' }: RivalCardProps) {
  return (
    <Card className={`rival-card ${className}`}>
      <CardHeader className="text-center border-b border-border/30 pb-4">
        <div className="flex items-center justify-center mb-2">
          <div className="rival-avatar">
            <div className="rival-avatar-inner">
              {/* Placeholder for rival avatar - would be an actual image in production */}
              <div className="rival-avatar-placeholder">
                {rival.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold neon-text">{rival.name}</CardTitle>
        <CardDescription className="text-lg mt-2">
          {rival.personalityType}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-6">
        <div className="glass p-4 rounded-lg">
          <p className="text-sm">{rival.description}</p>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold glow-text">Rival Traits</h3>
          <div className="grid grid-cols-1 gap-3">
            {rival.traits.map((trait) => (
              <div key={trait.id} className="trait-comparison">
                <div className="trait-header">
                  <h4 className="trait-name capitalize">{trait.name}</h4>
                  <div className="trait-score">{trait.value}/5</div>
                </div>
                <div className="trait-meter">
                  <div 
                    className={`trait-meter-fill ${trait.comparison}`}
                    style={{width: `${(trait.value / 5) * 100}%`}}
                  ></div>
                </div>
                <p className="trait-manifestation">{trait.manifestation}</p>
              </div>
            ))}
          </div>
        </div>
        
        {showPerformance && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold glow-text">Performance Predictions</h3>
            <div className="grid grid-cols-1 gap-3">
              {['round1', 'round2', 'round3'].map((round, index) => {
                const roundKey = round as keyof typeof rival.predictions;
                const prediction = rival.predictions[roundKey];
                const actual = rival.performance[roundKey];
                
                return (
                  <div key={round} className="performance-prediction">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Round {index + 1}</span>
                      <div className="flex items-center">
                        {actual !== undefined ? (
                          <>
                            <span className="text-muted-foreground mr-2">Predicted: {prediction}%</span>
                            <span className="font-bold">{actual}%</span>
                          </>
                        ) : (
                          <span>{prediction}%</span>
                        )}
                      </div>
                    </div>
                    <div className="prediction-bar">
                      <div 
                        className="prediction-fill"
                        style={{width: `${prediction}%`}}
                      ></div>
                      {actual !== undefined && (
                        <div 
                          className="actual-fill"
                          style={{width: `${actual}%`}}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {showComparison && rival.overallComparison && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold glow-text">Overall Comparison</h3>
            
            <div className="comparison-overview glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(rival.overallComparison.userScore)}%</div>
                  <div className="text-sm text-muted-foreground">Your Score</div>
                </div>
                
                <div className="comparison-indicator">
                  {rival.overallComparison.difference > 0 ? (
                    <span className="text-green-500">+{Math.round(rival.overallComparison.difference)}%</span>
                  ) : rival.overallComparison.difference < 0 ? (
                    <span className="text-red-500">{Math.round(rival.overallComparison.difference)}%</span>
                  ) : (
                    <span className="text-yellow-500">Equal</span>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(rival.overallComparison.rivalScore)}%</div>
                  <div className="text-sm text-muted-foreground">Rival Score</div>
                </div>
              </div>
              
              <div className="comparison-bar">
                <div 
                  className="user-score-fill"
                  style={{width: `${rival.overallComparison.userScore}%`}}
                ></div>
                <div 
                  className="rival-score-fill"
                  style={{width: `${rival.overallComparison.rivalScore}%`}}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="advantage-area">
                <h4 className="text-sm font-medium mb-2">Your Advantages</h4>
                <ul className="space-y-1">
                  {rival.overallComparison.userAdvantageAreas.length > 0 ? (
                    rival.overallComparison.userAdvantageAreas.map((area, index) => (
                      <li key={index} className="text-sm text-green-500">{area}</li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">None identified</li>
                  )}
                </ul>
              </div>
              
              <div className="advantage-area">
                <h4 className="text-sm font-medium mb-2">Rival Advantages</h4>
                <ul className="space-y-1">
                  {rival.overallComparison.rivalAdvantageAreas.length > 0 ? (
                    rival.overallComparison.rivalAdvantageAreas.map((area, index) => (
                      <li key={index} className="text-sm text-red-500">{area}</li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">None identified</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col pt-4 border-t border-border/30">
        <div className="grid grid-cols-2 gap-3 w-full">
          <div>
            <h4 className="text-sm font-medium mb-1">Strengths</h4>
            <ul className="space-y-1">
              {rival.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-muted-foreground">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Weaknesses</h4>
            <ul className="space-y-1">
              {rival.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-muted-foreground">{weakness}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
