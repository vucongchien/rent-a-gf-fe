'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/atoms/Button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Đã xảy ra lỗi</h1>
        <p className="text-text-muted">
          Hệ thống tạm thời không phản hồi. Vui lòng thử lại sau ít phút.
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono">Mã lỗi: {error.digest}</p>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="primary" onClick={reset}>
            Thử lại
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
