'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Companion } from '@/shared/types';


export interface FeaturedCompanion {
  id: string;
  name: string;
  location: string;
  price: string;
  avatarUrl?: string;
  voiceUrl?: string | null;
  metadata?: string[];
}

interface ExploreContextType {
  allCompanions: Companion[];
  featuredCompanion: FeaturedCompanion | null;
  totalCount: number;
  isLoading: boolean;
}

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

export function ExploreProvider({ children }: { children: React.ReactNode }) {
  const [allCompanions, setAllCompanions] = useState<Companion[]>([]);
  const [featured, setFeatured] = useState<FeaturedCompanion | null>(null);
  const [totalCount, setTotalCount] = useState<number>(27); // Giá trị mặc định hiển thị ngay để tránh block
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companions?limit=100')
      .then(res => res.json())
      .then(json => {
        const items = json.data?.items || [];
        setAllCompanions(items);
        if (items.length > 0) {
          const firstItem = items[0];
          setFeatured({
            id: firstItem.id,
            name: firstItem.displayName,
            location: firstItem.city,
            price: firstItem.featuredScenario ? `${firstItem.featuredScenario.priceInCoin} KC` : 'Liên hệ',
            avatarUrl: firstItem.avatarUrl,
            voiceUrl: firstItem.voiceIntroUrl,
            metadata: firstItem.metadata || [],
          });
        }
        setTotalCount(json.data?.meta?.total || items.length || 27);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('[ExploreContext] Lỗi tải dữ liệu bạn đồng hành:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <ExploreContext.Provider value={{ allCompanions, featuredCompanion: featured, totalCount, isLoading }}>
      {children}
    </ExploreContext.Provider>
  );
}

export function useExplore() {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error('useExplore must be used within an ExploreProvider');
  }
  return context;
}
