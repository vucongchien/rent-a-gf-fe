import React, { Suspense } from 'react';
import { ExploreHero } from './components/ExploreHero';
import { ExploreGridServer } from './components/ExploreGridServer';
import { ExploreGridSkeleton } from './components/Skeletons';
import { FilterBarClient } from './components/FilterBarClient';
import { MobileHeader } from '@/shared/components/organisms/MobileHeader';
import { HeartIcon } from '@/shared/components/atoms/Icons';
import { WalletButton } from '@/shared/components/atoms/WalletButton';
import { SearchInput } from '@/shared/components/atoms/SearchInput';

interface ExplorePageProps {
  searchParams: Promise<{ city?: string; limit?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { city, limit: limitStr } = await searchParams;
  const limit = limitStr ? Math.max(6, parseInt(limitStr, 10)) : 6;

  const activeCity = city ?? 'all';

  const mobileHeaderLeft = (
    <div className="flex items-center gap-[6px] font-semibold">
      <div className="w-[32px] h-[32px] rounded-[10px] grid place-items-center bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_4px_10px_-4px_rgba(251,105,153,0.6),inset_0_1px_0_#fff]">
        <HeartIcon fill="#fff" size={16} className="text-white" />
      </div>
      <span className="font-sans text-[18px] tracking-[-0.02em] font-semibold">
        <em className="not-italic italic text-chizuru-600">kanojo</em>
      </span>
    </div>
  );

  const mobileHeaderRight = (
    <>
      <SearchInput 
        placeholder="Search names, traits..." 
        className="w-[140px] h-[36px] min-w-0 px-3 text-xs" 
      />
      <WalletButton />
    </>
  );

  return (
    <>
      <MobileHeader left={mobileHeaderLeft} right={mobileHeaderRight} />

        <ExploreHero />

      {/* FilterBar render ngay — không bị block bởi Suspense */}
      <FilterBarClient activeCity={activeCity} />

      <Suspense key={`${activeCity}`} fallback={<ExploreGridSkeleton />}>
        <ExploreGridServer city={city} limit={limit} />
      </Suspense>
    </>
  );
}
