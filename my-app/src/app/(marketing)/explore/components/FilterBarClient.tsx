'use client';

import React, { useCallback, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FilterBar } from '@/shared/components/molecules/FilterBar';
import { EXPLORE_FILTERS } from '../constants';

interface FilterBarClientProps {
  activeCity: string;
}

export function FilterBarClient({ activeCity }: FilterBarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = useCallback(
    (cityId: string) => {
      if (cityId === activeCity) return;

      startTransition(() => {
        const params = new URLSearchParams();
        if (cityId !== 'all') {
          params.set('city', cityId);
        }
        // Reset limit khi đổi city
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [activeCity, pathname, router],
  );

  return (
    <div
      className="pb-[16px] border-b border-neutral-100 mb-[24px]"
      data-pending={isPending ? '' : undefined}
      style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 150ms ease' }}
    >
      <FilterBar
        activeFilter={activeCity}
        onFilterChange={handleFilterChange}
        filters={EXPLORE_FILTERS}
      />
    </div>
  );
}
