import React from 'react';
import { CompanionCardSkeleton } from '@/shared/components/atoms/CompanionCardSkeleton';

export const ExploreGridSkeleton: React.FC = () => {
  return (
    <section className="scroll-mt-[100px]">
      <div className="pb-[16px] border-b border-neutral-100 mb-[24px]">
        {/* Placeholder cho FilterBar */}
        <div className="h-[40px] bg-neutral-100 rounded-lg animate-pulse w-[320px]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[22px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <CompanionCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
};
