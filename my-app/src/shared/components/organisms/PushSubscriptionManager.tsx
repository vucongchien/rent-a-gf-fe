'use client';

import { useState, useEffect } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification, getVapidPublicKey } from '@/app/actions/pwa';
import { Button } from '@/shared/components/atoms/Button';
import { BellIcon } from '@/shared/components/atoms/Icons';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushSubscriptionManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error('Service worker registration failed:', err);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      const timer = setTimeout(() => {
        setIsSupported(true);
        registerServiceWorker();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleSubscribe() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        throw new Error('VAPID Public key is not configured or generated on server.');
      }
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      setSubscription(sub);

      const subJSON = sub.toJSON();
      if (!subJSON.endpoint) {
        throw new Error('Subscription endpoint is missing.');
      }
      await subscribeUser({
        endpoint: subJSON.endpoint,
        keys: {
          p256dh: subJSON.keys?.p256dh || '',
          auth: subJSON.keys?.auth || '',
        }
      });
    } catch (err) {
      console.error('Failed to subscribe user to push notifications:', err);
      alert('Đăng ký nhận thông báo thất bại. Vui lòng cấp quyền thông báo cho trang web!');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setIsLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        await unsubscribeUser();
      }
    } catch (err) {
      console.error('Failed to unsubscribe user from push notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendTest() {
    if (message.trim()) {
      setIsLoading(true);
      try {
        await sendNotification(message);
        setMessage('');
      } catch (err) {
        console.error('Error sending test notification:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }

  if (!isSupported) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center text-slate-400 text-sm">
        Trình duyệt hoặc thiết bị của bạn không hỗ trợ Web Push Notification.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 text-white space-y-4 max-w-md w-full shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
          <BellIcon size={24} className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Thông Báo Hệ Thống (Web Push)</h3>
          <p className="text-xs text-slate-400">Nhận tin nhắn mới từ Companion lập tức.</p>
        </div>
      </div>

      {subscription ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 rounded-2xl">
            <div className="text-xs text-emerald-400 font-medium">✓ Đã đăng ký nhận thông báo.</div>
            <Button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              variant="unstyled"
              className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-colors font-medium cursor-pointer"
            >
              Hủy Đăng Ký
            </Button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <label className="text-xs text-slate-400 font-medium block">Gửi thử tin nhắn:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nội dung thông báo thử..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-950 rounded-2xl text-sm border border-slate-800 focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
              />
              <Button
                onClick={handleSendTest}
                disabled={isLoading || !message.trim()}
                variant="unstyled"
                className="px-5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-rose-500/40 disabled:to-pink-600/40 rounded-2xl text-sm font-medium transition-all active:scale-[0.97] cursor-pointer"
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-2 space-y-3">
          <p className="text-sm text-slate-400">
            Hãy kích hoạt để không bỏ lỡ các tin nhắn quan trọng từ companion ngay cả khi bạn không mở trang web.
          </p>
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            variant="unstyled"
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 text-white font-medium rounded-2xl shadow-lg shadow-rose-500/10 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? 'Đang kích hoạt...' : 'Kích Hoạt Nhận Thông Báo'}
          </Button>
        </div>
      )}
    </div>
  );
}
