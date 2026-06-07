import React from 'react';
import { CompanionCardSkeleton } from '@/shared/components/atoms/CompanionCardSkeleton';

export const ExploreGridSkeleton: React.FC = () => {
  return (
    <section className="scroll-mt-[100px]">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[22px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <CompanionCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
};
