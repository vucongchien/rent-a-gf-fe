import React from 'react';
import { companionService } from '@/shared/services/companionService';
import { HeroContent } from './HeroContent';
import { HeroFeatured } from './HeroFeatured';

export async function ExploreHero() {
  const { featuredCompanion, totalCount } = await companionService.getFeaturedCompanion();

  // Convert Companion type sang FeaturedCompanion type của HeroFeatured component
  const formattedFeatured = featuredCompanion ? {
    id: featuredCompanion.id,
    name: featuredCompanion.displayName,
    location: featuredCompanion.city,
    price: featuredCompanion.featuredScenario ? `${featuredCompanion.featuredScenario.priceInCoin} KC` : 'Liên hệ',
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
