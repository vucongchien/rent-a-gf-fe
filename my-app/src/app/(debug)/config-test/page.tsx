'use client';

import { useState, useEffect } from 'react';
import { getAppConfig, setAppConfig } from '@/app/actions/config';
import { Button } from '@/shared/components/atoms/Button';

interface FeaturesConfig {
  chatEnabled?: boolean;
  bookingEnabled?: boolean;
  maintenanceMode?: boolean;
}

export default function ConfigTestPage() {
  const [greeting, setGreeting] = useState<string>('Đang tải...');
  const [newGreeting, setNewGreeting] = useState('');
  const [features, setFeatures] = useState<FeaturesConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendType, setBackendType] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const g = await getAppConfig<string>('greeting');
      const f = await getAppConfig<FeaturesConfig>('features');
      
      setGreeting(g || 'Chưa cấu hình (undefined)');
      setFeatures(f || {});
      
      // Đọc thông số config backend từ process.env qua server action gián tiếp (mocking info)
      // Mặc định in-memory
      setBackendType(process.env.NEXT_PUBLIC_CONFIG_BACKEND_MOCK || 'Đọc từ cấu hình ConfigService (BFF)');
    } catch (err) {
      console.error('Error fetching config:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateGreeting() {
    if (!newGreeting.trim()) return;
    setIsLoading(true);
    try {
      const success = await setAppConfig<string>('greeting', newGreeting);
      if (success) {
        alert('Cập nhật "greeting" thành công!');
        setNewGreeting('');
        await fetchData();
      } else {
        alert('Cập nhật thất bại! Vui lòng kiểm tra Vercel Write Token / config.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-rose-400 bg-clip-text text-transparent">
          Kiểm Thử ConfigService
        </h1>
        <p className="text-sm text-slate-400 max-w-sm">
          Trang kiểm thử đọc/ghi tham số cấu hình hệ thống bằng Edge Config / In-Memory.
        </p>
      </div>

      <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        {/* Info Box */}
        <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-500 font-medium">CONFIG_BACKEND hiện tại:</span>
          <span className="text-blue-400 font-semibold px-2 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/20">
            {backendType}
          </span>
        </div>

        {/* Display Box */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Giá trị key &quot;greeting&quot;:</span>
            <div className="text-sm font-semibold text-slate-200 leading-relaxed">
              {isLoading ? 'Đang tải...' : greeting}
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs text-slate-500 font-medium block">Giá trị key &quot;features&quot;:</span>
            <pre className="text-xs font-mono text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 overflow-x-auto">
              {isLoading ? 'Đang tải...' : JSON.stringify(features, null, 2)}
            </pre>
          </div>
        </div>

        {/* Form Box */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <label className="text-xs text-slate-400 font-medium block">Cập nhật &quot;greeting&quot; mới:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newGreeting}
              onChange={(e) => setNewGreeting(e.target.value)}
              placeholder="Nhập chuỗi greeting mới..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-950 rounded-2xl text-sm border border-slate-800 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
            />
            <Button
              onClick={handleUpdateGreeting}
              disabled={isLoading || !newGreeting.trim()}
              variant="unstyled"
              className="px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 rounded-2xl text-sm font-medium transition-all active:scale-[0.97] cursor-pointer"
            >
              Cập nhật
            </Button>
          </div>
        </div>

        <Button
          onClick={fetchData}
          disabled={isLoading}
          variant="unstyled"
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-2xl transition-all cursor-pointer"
        >
          Reload dữ liệu
        </Button>
      </div>

      <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-500 space-y-2 leading-relaxed">
        <div className="font-semibold text-slate-400">💡 Hướng dẫn kiểm thử Vercel Edge Config:</div>
        <ul className="list-disc pl-4 space-y-1.5">
          <li><strong>Local Dev (Fallback)</strong>: Mặc định không cấu hình gì, hệ thống dùng <code className="bg-slate-950 px-1 py-0.5 rounded text-rose-400 font-mono">in-memory</code> để đọc/ghi bình thường.</li>
          <li><strong>Production (Edge Config)</strong>: Để bật Edge Config, cấu hình các biến môi trường sau trên Vercel:
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li><code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono">CONFIG_BACKEND</code> = <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 font-mono">edge-config</code></li>
              <li><code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono">EDGE_CONFIG</code> = <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-400 font-mono">&quot;https://edge-config.vercel.com/...&quot;</code> (Vercel tự tạo khi link Edge Config)</li>
              <li><code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono">VERCEL_ACCESS_TOKEN</code> = <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-400 font-mono">&quot;AccessToken_của_bạn&quot;</code> (Cần để ghi/set dữ liệu)</li>
            </ul>
          </li>
        </ul>
      </div>
    </main>
  );
}
