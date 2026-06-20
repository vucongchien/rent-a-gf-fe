import React, { Suspense } from 'react';
import { ExploreHero } from './components/ExploreHero';
import { ExploreGridServer } from './components/ExploreGridServer';
import { ExploreGridSkeleton } from './components/Skeletons';
import { FilterBarClient } from './components/FilterBarClient';

interface ExplorePageProps {
  searchParams: Promise<{ city?: string; limit?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { city, limit: limitStr } = await searchParams;
  const limit = limitStr ? Math.max(6, parseInt(limitStr, 10)) : 6;

  const activeCity = city ?? 'all';

  return (
    <>
      <ExploreHero />
      <FilterBarClient activeCity={activeCity} />

      <Suspense key={`${activeCity}`} fallback={<ExploreGridSkeleton />}>
        <ExploreGridServer city={city} limit={limit} />
      </Suspense>
    </>
  );
}
