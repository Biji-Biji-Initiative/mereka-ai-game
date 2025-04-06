'use client';

import React from 'react';
import { Welcome } from '@/features/welcome/welcome';
import { GameIntegration } from '@/components/game/GameIntegration';

export default function Home() {
  // We no longer need to conditionally render based on currentStep
  // The useRouter in the Welcome component will handle navigation to other pages
  
  return (
    <main className="container mx-auto px-4 py-8">
      <GameIntegration />
      <Welcome />
    </main>
  );
}
