import React, { Suspense } from 'react';
import { ExploreHero } from './components/ExploreHero';
import { ExploreGridServer } from './components/ExploreGridServer';
import { ExploreGridSkeleton } from './components/Skeletons';
import { SiteHeader } from '@/shared/components/organisms/SiteHeader';

export default function ExplorePage() {
  return (
    <>
      <SiteHeader />

      <ExploreHero />

      <Suspense fallback={<ExploreGridSkeleton />}>
        <ExploreGridServer />
      </Suspense>
    </>
  );
}
