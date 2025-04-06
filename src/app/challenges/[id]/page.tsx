'use client';

import { Suspense } from 'react';
import ChallengeDetailPage from '@/features/challenges/ChallengeDetailPage';
import { Skeleton } from '@/components/ui/skeleton';

// Removed explicit PageProps interface - let Next.js/TypeScript infer

/**
 * Challenge detail page component
 * Props are inferred by Next.js.
 */
export default function Page({ params }: { params: { id: string } }) {
  // Directly extract id from params
  const { id } = params;

  // Check if id is valid (simple check)
  if (!id || typeof id !== 'string') {
    // Handle invalid ID case, maybe redirect or show an error
    // For now, render null or a basic error message
    return <div>Invalid challenge ID</div>; 
  }

  return (
    <Suspense fallback={<div className="p-4"><Skeleton className="h-[600px] w-full rounded-md" /></div>}>
      {/* Pass the validated id within the expected params object structure */}
      <ChallengeDetailPage params={{ id }} />
    </Suspense>
  );
}
