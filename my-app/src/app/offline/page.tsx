'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { OfflineIcon } from '@/shared/components/atoms/Icons';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Tránh cascading render bằng cách trì hoãn setState
    const timer = setTimeout(() => {
      setIsOnline(navigator.onLine);
    }, 0);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/';
    } else {
      alert('Bạn vẫn đang ngoại tuyến. Vui lòng kiểm tra lại kết nối Internet!');
    }
  };

  return (
    <main className="min-h-screen bg-surface text-text flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 bg-surface border border-border p-8 rounded-3xl shadow-card-info relative overflow-hidden">
        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="p-5 bg-surface rounded-2xl border border-border inline-flex shadow-sm">
            <OfflineIcon size={48} className="text-brand animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Không Có Kết Nối Mạng
          </h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Ứng dụng Rent-a-Girlfriend hiện đang chạy ở chế độ <strong>chỉ đọc (Read-only)</strong>. Các tương tác ghi dữ liệu mới tạm thời bị vô hiệu hóa cho đến khi thiết bị trực tuyến trở lại.
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <Button
            onClick={handleRetry}
            variant="primary"
            className="w-full"
          >
            Thử Kết Nối Lại
          </Button>

          <div className="text-xs text-text-muted flex items-center justify-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-success animate-ping' : 'bg-error animate-pulse'}`} />
            Trạng thái thiết bị: {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
          </div>
        </div>
      </div>
    </main>
  );
}
