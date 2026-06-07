'use client';

import { useState, useCallback, useMemo } from 'react';

export interface Companion {
  id: string;
  displayName: string;
  city: string;
  ratingAvg: number;
  reviewCount: number;
  avatarUrl: string;
  voiceIntroUrl: string | null;
  featuredScenario: { name: string; priceInCoin: number } | null;
  metadata?: string[];
}

export function useCompanions(allCompanions: Companion[]) {
  const [activeCity, setActiveCity] = useState('all');
  const [displayCount, setDisplayCount] = useState(6);

  // Lọc danh sách bạn đồng hành trên client
  const filteredCompanions = useMemo(() => {
    if (activeCity === 'all') return allCompanions;
    return allCompanions.filter(c => c.city === activeCity);
  }, [allCompanions, activeCity]);

  // Phân trang trên client
  const displayedCompanions = useMemo(() => {
    return filteredCompanions.slice(0, displayCount);
  }, [filteredCompanions, displayCount]);

  const hasNextPage = displayCount < filteredCompanions.length;

  const handleFilterChange = useCallback((cityId: string) => {
    if (cityId === activeCity) return;
    
    const applyFilter = () => {
      setActiveCity(cityId);
      setDisplayCount(6);
    };

    if (document.startViewTransition) {
      document.startViewTransition(applyFilter);
    } else {
      applyFilter();
    }
  }, [activeCity]);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage) return;
    setDisplayCount(prev => prev + 6);
  }, [hasNextPage]);

  return {
    companions: displayedCompanions,
    activeCity,
    hasNextPage,
    handleFilterChange,
    handleLoadMore,
  };
}
