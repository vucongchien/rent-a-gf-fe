import React from 'react';
import { companionService } from '@/shared/services/companionService';
import { CompanionCard } from '@/shared/components/molecules/CompanionCard';
import { LoadMoreClient } from './LoadMoreClient';

const DEFAULT_LIMIT = 6;

interface ExploreGridServerProps {
  city?: string;
  limit?: number;
}

export async function ExploreGridServer({ city, limit = DEFAULT_LIMIT }: ExploreGridServerProps) {
  const { items, hasNextPage } = await companionService.getCompanions({
    city,
    limit,
  });

  const activeCity = city ?? 'all';

  return (
    <section id="explore-grid" className="scroll-mt-[100px]">


      {items.length === 0 ? (
        <div className="text-center py-[60px] text-neutral-500 font-sans">
          Không tìm thấy bạn đồng hành nào ở khu vực này.
        </div>
      ) : (
        <div
          data-testid="companion-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[22px]"
        >
          {items.map((comp) => (
            <CompanionCard
              key={comp.id}
              id={comp.id}
              name={comp.displayName}
              location={comp.city}
              price={comp.featuredScenario ? `${comp.featuredScenario.priceInCoin} KC` : 'Free to meet'}
              avatarUrl={comp.avatarUrl}
              voiceUrl={comp.voiceIntroUrl}
              traits={comp.reviewCount === 0 ? ['new'] : undefined}
              metadata={
                comp.metadata && comp.metadata.length > 0
                  ? comp.metadata
                  : [comp.featuredScenario?.name || 'Friendly chat']
              }
            />
          ))}
        </div>
      )}

      {/* Client island: Load more qua URL */}
      {hasNextPage && items.length > 0 && (
        <LoadMoreClient city={activeCity} currentLimit={limit} />
      )}
    </section>
  );
}

export default ExploreGridServer;
