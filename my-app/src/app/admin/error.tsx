'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/atoms/Button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin/error]', error);
  }, [error]);

  return (
    <div className="flex-1 p-8">
      <div className="max-w-xl mx-auto space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-red-600">Admin: lỗi tải dữ liệu</h1>
        <p className="text-sm text-neutral-700">
          {error.message || 'Một service backend đang không phản hồi.'}
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-500 font-mono">digest: {error.digest}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={reset}>
            Thử lại
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/admin')}>
            Về Admin Home
          </Button>
        </div>
      </div>
    </div>
  );
}
