'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/shared/components/atoms/Button';

interface LoadMoreClientProps {
  city: string;
  currentLimit: number;
  step?: number;
}

export function LoadMoreClient({ city, currentLimit, step = 6 }: LoadMoreClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (city !== 'all') {
        params.set('city', city);
      }
      params.set('limit', String(currentLimit + step));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex justify-center mt-[40px]">
      <Button
        onClick={handleLoadMore}
        disabled={isPending}
        variant="outline"
        className="px-[30px] h-[50px] font-semibold text-[15px] rounded-xl"
      >
        {isPending ? 'Đang tải...' : 'Tải thêm bạn đồng hành'}
      </Button>
    </div>
  );
}
