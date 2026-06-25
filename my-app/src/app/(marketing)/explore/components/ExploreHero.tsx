import React from 'react';
import { companionService } from '@/shared/services/companionService';
import { cityLabel } from '@/shared/constants/cities';
import { HeroContent } from './HeroContent';
import { HeroFeatured } from './HeroFeatured';

export async function ExploreHero() {
  const { featuredCompanion, totalCount } = await companionService.getFeaturedCompanion();

  // Convert Companion type sang FeaturedCompanion type của HeroFeatured component
  const formattedFeatured = featuredCompanion ? {
    id: featuredCompanion.companionId,
    name: featuredCompanion.displayName,
    location: featuredCompanion.availableCities.map(cityLabel).join(', '),
    price: featuredCompanion.minPrice ? `${featuredCompanion.minPrice} KC` : 'Liên hệ',
    avatarUrl: featuredCompanion.avatarUrl,
    voiceUrl: featuredCompanion.voiceIntroUrl,
    metadata: featuredCompanion.metadata,
  } : null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-[36px] items-center mb-[54px]">
      <HeroContent totalCount={totalCount} />
      {formattedFeatured ? (
        <HeroFeatured featuredCompanion={formattedFeatured} />
      ) : (
        <div className="hidden md:block" aria-hidden="true" />
      )}
    </section>
  );
}
export default ExploreHero;
