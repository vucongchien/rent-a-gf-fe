import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ExploreHero } from './components/ExploreHero';
import { ExploreGridServer } from './components/ExploreGridServer';
import { ExploreGridSkeleton } from './components/Skeletons';
import { FilterBarClient } from './components/FilterBarClient';
import { normalizeCityCode, cityLabel } from '@/shared/constants/cities';

const EXPLORE_TITLE = 'Khám phá người đồng hành';
const EXPLORE_DESCRIPTION =
  'Duyệt qua danh sách người bạn đồng hành theo thành phố — Hà Nội, TP. Hồ Chí Minh, Đà Nẵng và nhiều nơi khác. Chọn người phù hợp, đặt lịch hẹn ngay hôm nay.';

interface ExplorePageProps {
  searchParams: Promise<{ city?: string; limit?: string }>;
}

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const { city } = await searchParams;
  const activeCity = city ? normalizeCityCode(city) : 'all';
  const cityName = activeCity !== 'all' ? cityLabel(activeCity) : null;

  const title = cityName
    ? `Người đồng hành tại ${cityName}`
    : EXPLORE_TITLE;
  const description = cityName
    ? `Khám phá những người bạn đồng hành tuyệt vời tại ${cityName}. Đặt lịch hẹn an toàn, minh bạch với Kano-Coin.`
    : EXPLORE_DESCRIPTION;

  return {
    title,
    description,
    alternates: { canonical: '/explore' },
    openGraph: {
      title,
      description,
      url: '/explore',
      type: 'website',
    },
    twitter: { title, description },
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { city, limit: limitStr } = await searchParams;
  const limit = limitStr ? Math.max(6, parseInt(limitStr, 10)) : 6;

  const activeCity = city ? normalizeCityCode(city) : 'all';

  return (
    <>
      <ExploreHero />
      <FilterBarClient activeCity={activeCity} />

      <Suspense key={`${activeCity}`} fallback={<ExploreGridSkeleton />}>
        <ExploreGridServer city={activeCity} limit={limit} />
      </Suspense>
    </>
  );
}
