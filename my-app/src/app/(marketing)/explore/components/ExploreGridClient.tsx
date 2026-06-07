'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FilterBar } from '@/shared/components/molecules/FilterBar';
import { CompanionGrid } from './CompanionGrid';
import { EXPLORE_FILTERS } from '../constants';
import type { Companion } from '@/shared/types';

interface ExploreGridClientProps {
  initialCompanions: Companion[];
  initialHasNextPage: boolean;
}

export const ExploreGridClient: React.FC<ExploreGridClientProps> = ({
  initialCompanions,
  initialHasNextPage,
}) => {
  const [activeCity, setActiveCity] = useState('all');
  const [companions, setCompanions] = useState<Companion[]>(initialCompanions);
  const [limit, setLimit] = useState(6);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  const fetchCompanions = useCallback(async (city: string, currentLimit: number) => {
    setIsLoading(true);
    try {
      const cityQuery = city !== 'all' ? `&city=${encodeURIComponent(city)}` : '';
      const response = await fetch(`/api/companions?limit=${currentLimit}${cityQuery}`);
      const json = await response.json();
      
      const items = json.data?.items || [];
      const hasNext = json.data?.meta?.hasNextPage ?? false;
      
      setCompanions(items);
      setHasNextPage(hasNext);
    } catch (err) {
      console.error('[ExploreGridClient] Lỗi fetch companions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchCompanions(activeCity, limit);
  }, [activeCity, limit, fetchCompanions]);

  const handleFilterChange = useCallback((cityId: string) => {
    if (cityId === activeCity) return;
    
    const applyFilter = () => {
      setActiveCity(cityId);
      setLimit(6);
      setCompanions([]); // Xóa danh sách cũ ngay lập tức để kích hoạt hiển thị skeleton
    };

    if (document.startViewTransition) {
      document.startViewTransition(applyFilter);
    } else {
      applyFilter();
    }
  }, [activeCity]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || !hasNextPage) return;
    setLimit(prev => prev + 6);
  }, [isLoading, hasNextPage]);

  return (
    <section id="explore-grid" className="scroll-mt-[100px]">
      <div className="pb-[16px] border-b border-neutral-100 mb-[24px]">
        <FilterBar
          activeFilter={activeCity}
          onFilterChange={handleFilterChange}
          filters={EXPLORE_FILTERS}
        />
      </div>

      <CompanionGrid 
        companions={companions}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
      />
    </section>
  );
};

export default ExploreGridClient;
