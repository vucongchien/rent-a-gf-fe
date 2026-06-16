import React from 'react';
import { ExploreGridSkeleton } from './components/Skeletons';

export default function ExploreLoading() {
  return (
    <div className="space-y-6">
      {/* Hero section skeleton */}
      <div className="h-[260px] bg-neutral-100 rounded-3xl w-full animate-pulse" />
      {/* Filter bar skeleton */}
      <div className="h-12 bg-neutral-100 rounded-full w-2/3 animate-pulse" />
      {/* Grid skeleton */}
      <ExploreGridSkeleton />
    </div>
  );
}
