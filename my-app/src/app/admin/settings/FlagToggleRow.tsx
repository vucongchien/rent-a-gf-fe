'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminFeatureFlag } from '@/shared/types';
import { toggleFeatureFlagAction } from './actions';

interface FlagToggleRowProps {
  flag: AdminFeatureFlag;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const FlagToggleRow: React.FC<FlagToggleRowProps> = ({ flag }) => {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(flag.enabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !optimistic;
    setOptimistic(next);
    setError(null);
    startTransition(async () => {
      const res = await toggleFeatureFlagAction(flag.key, next);
      if (!res.ok) {
        // Rollback
        setOptimistic(!next);
        setError(res.error ?? 'Có lỗi xảy ra');
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex items-start justify-between gap-6 py-5 first:pt-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-semibold text-neutral-900">{flag.label}</p>
          <code className="text-[11px] font-mono text-text-muted bg-neutral-100 px-1.5 py-0.5 rounded">
            {flag.key}
          </code>
        </div>
        <p className="text-[12.5px] text-text-muted leading-relaxed mt-1">
          {flag.description}
        </p>
        <p className="text-[11px] text-text-muted mt-2">
          Cập nhật lần cuối: {formatDateTime(flag.updatedAt)}
          {flag.updatedBy && <> · bởi {flag.updatedBy}</>}
        </p>
        {error && (
          <p className="text-[11.5px] text-rose-400 mt-2">{error}</p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        onClick={handleToggle}
        disabled={isPending}
        className={[
          'relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-60',
          optimistic ? 'bg-ruka-500' : 'bg-neutral-300',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all',
            optimistic ? 'left-[26px]' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
};

export default FlagToggleRow;
