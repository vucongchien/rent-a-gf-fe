'use client';

import React from 'react';
import { useExplore } from '../contexts/ExploreContext';
import { HeroContent } from './HeroContent';
import { HeroFeatured } from './HeroFeatured';
import { HeroFeaturedSkeleton } from './HeroFeaturedSkeleton';

export interface HeroSectionProps {
  onExploreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
}) => {
  const { totalCount, featuredCompanion, isLoading } = useExplore();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-[36px] items-center mb-[54px]">
      <HeroContent totalCount={totalCount} onExploreClick={onExploreClick} />
      {isLoading ? (
        <HeroFeaturedSkeleton />
      ) : featuredCompanion ? (
        <HeroFeatured featuredCompanion={featuredCompanion} />
      ) : (
        // Giữ chiều cao cột 2 ổn định khi không có featured companion
        // tránh layout shift: hero grid vẫn là 2 cột
        <div className="hidden md:block" aria-hidden="true" />
      )}
    </section>
  );
};
