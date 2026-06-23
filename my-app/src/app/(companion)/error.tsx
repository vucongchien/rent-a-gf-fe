'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/atoms/Button';

export default function CompanionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[(companion)/error]', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Không tải được trang Companion</h1>
        <p className="text-text-muted">
          Một dịch vụ phía sau đang bị lỗi. Hãy thử lại — dữ liệu của bạn vẫn an toàn.
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono">Mã lỗi: {error.digest}</p>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="primary" onClick={reset}>
            Thử lại
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            Về dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
