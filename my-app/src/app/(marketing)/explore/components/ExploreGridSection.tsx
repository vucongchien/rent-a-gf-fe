'use client';

import React from 'react';
import { FilterBar } from '@/shared/components/molecules/FilterBar';
import { CompanionGrid } from './CompanionGrid';
import { useCompanions, Companion } from '../hooks/useCompanions';
import { useExplore } from '../contexts/ExploreContext';
import { EXPLORE_FILTERS } from '../constants';

interface ExploreGridSectionProps {
  allCompanions: Companion[];
}

export const ExploreGridSection: React.FC<ExploreGridSectionProps> = ({
  allCompanions,
}) => {
  const { isLoading } = useExplore();
  const {
    companions,
    activeCity,
    hasNextPage,
    handleFilterChange,
    handleLoadMore,
  } = useCompanions(allCompanions);

  return (
    <section id="explore-grid" className="scroll-mt-[100px]">
      <div className="pb-[16px] border-b border-neutral-100 mb-[24px]">
        <FilterBar
          activeFilter={activeCity}
          onFilterChange={handleFilterChange}
          filters={EXPLORE_FILTERS}
        />
      </div>

      <CompanionGrid 
        companions={companions}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
      />
    </section>
  );
};
