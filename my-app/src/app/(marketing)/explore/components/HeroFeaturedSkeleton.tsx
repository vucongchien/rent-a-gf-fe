import React from 'react';

export const HeroFeaturedSkeleton: React.FC = () => {
  return (
    <div className="relative bg-white border border-neutral-200 rounded-[30px] p-[14px] md:shadow-hero md:rotate-[1.4deg] md:max-w-none max-w-[480px] mx-auto w-full animate-pulse font-sans">
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3.4] bg-neutral-100 border border-neutral-200">
        <div className="absolute left-[14px] right-[14px] bottom-[14px] flex items-end justify-between gap-[10px] z-10">
          <div className="bg-white/80 backdrop-blur-[6px] border border-white rounded-[14px] p-[10px_14px] shadow-sm flex flex-col w-[160px]">
            <div className="h-[20px] bg-neutral-200 rounded-md w-3/4 mb-[6px]" />
            <div className="h-[12px] bg-neutral-100 rounded-md w-full" />
          </div>
          <div className="h-[40px] w-[54px] bg-neutral-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};
