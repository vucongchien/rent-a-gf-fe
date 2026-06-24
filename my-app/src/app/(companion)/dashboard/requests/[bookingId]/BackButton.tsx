'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';

export function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="unstyled"
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium text-neutral-500 hover:text-neutral-800 transition-colors mb-4 cursor-pointer"
    >
      <ChevronLeftIcon size={16} />
      Quay lại
    </Button>
  );
}
