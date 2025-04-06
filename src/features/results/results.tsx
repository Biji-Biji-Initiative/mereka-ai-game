import React from 'react';
import { useGameStore } from '@/store';
import ResultsProfile from '@/features/results/ResultsProfile';

// The Results component now simply wraps the ResultsProfile component
export function Results() {
  const profileId = useGameStore(state => state.profile?.id);
  
  return (
    <div className="results-container">
      <ResultsProfile profileId={profileId} />
    </div>
  );
}

export default Results;
