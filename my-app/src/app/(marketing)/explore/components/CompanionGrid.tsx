import React from 'react';
import { CompanionCard } from '@/shared/components/molecules/CompanionCard';
import { CompanionCardSkeleton } from '@/shared/components/atoms/CompanionCardSkeleton';
import { Button } from '@/shared/components/atoms/Button';
import { Companion } from '../hooks/useCompanions';

interface CompanionGridProps {
  companions: Companion[];
  isLoading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export const CompanionGrid: React.FC<CompanionGridProps> = ({
  companions,
  isLoading,
  hasNextPage,
  onLoadMore,
}) => {
  const showSkeletons = isLoading && companions.length === 0;

  return (
    <>
      <div data-testid="companion-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[22px]">
        {showSkeletons
          ? Array.from({ length: 6 }).map((_, index) => (
              <CompanionCardSkeleton key={index} />
            ))
          : companions.map((comp) => (
              <CompanionCard 
                key={comp.id}
                id={comp.id}
                name={comp.displayName}
                location={comp.city}
                price={comp.featuredScenario ? `${comp.featuredScenario.priceInCoin} KC` : 'Free to meet'}
                avatarUrl={comp.avatarUrl}
                voiceUrl={comp.voiceIntroUrl}
                traits={comp.reviewCount === 0 ? ['new'] : undefined}
                metadata={comp.metadata && comp.metadata.length > 0 ? comp.metadata : [comp.featuredScenario?.name || 'Friendly chat']}
                onMeet={() => alert(`We'll set up a meet-and-greet with ${comp.displayName} 🐾`)}
              />
            ))}
      </div>

      {!showSkeletons && companions.length === 0 && (
        <div className="text-center py-[60px] text-neutral-500 font-sans">
          Không tìm thấy bạn đồng hành nào ở khu vực này.
        </div>
      )}

      {!showSkeletons && hasNextPage && companions.length > 0 && (
        <div className="flex justify-center mt-[40px]">
          <Button 
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="px-[30px] h-[50px] font-semibold text-[15px] rounded-xl"
          >
            {isLoading ? 'Đang tải...' : 'Tải thêm bạn đồng hành'}
          </Button>
        </div>
      )}
    </>
  );
};
