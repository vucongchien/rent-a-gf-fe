'use client';

import React from 'react';
import { HeroSection } from './HeroSection';
import { ExploreGridSection } from './ExploreGridSection';
import { useExplore } from '../contexts/ExploreContext';

export function ExploreContent() {
  const { allCompanions } = useExplore();

  return (
    <>
      <HeroSection 
        onExploreClick={() => {
          document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <ExploreGridSection allCompanions={allCompanions} />
    </>
  );
}
