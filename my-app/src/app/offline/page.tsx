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
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/50 inline-flex shadow-inner">
            <OfflineIcon size={48} className="text-rose-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
            Không Có Kết Nối Mạng
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ứng dụng Rent-a-Girlfriend hiện đang chạy ở chế độ **chỉ đọc (Read-only)**. Các tương tác ghi dữ liệu mới tạm thời bị vô hiệu hóa cho đến khi thiết bị trực tuyến trở lại.
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <Button
            onClick={handleRetry}
            variant="unstyled"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-[0.98] text-white font-medium rounded-2xl shadow-lg shadow-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            Thử Kết Nối Lại
          </Button>
          
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
            Trạng thái thiết bị: {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
          </div>
        </div>
      </div>
    </main>
  );
}
