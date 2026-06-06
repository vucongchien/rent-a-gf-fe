'use client';

import React, { Suspense } from 'react';
import { SiteHeader } from '@/shared/components/organisms/SiteHeader';
import { ExploreProvider } from './contexts/ExploreContext';
import { ExploreContent } from './components/ExploreContent';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-sans text-neutral-500">Đang tải trang khám phá...</div>}>
      <SiteHeader />
      <ExploreProvider>
        <ExploreContent />
      </ExploreProvider>
    </Suspense>
  );
}
