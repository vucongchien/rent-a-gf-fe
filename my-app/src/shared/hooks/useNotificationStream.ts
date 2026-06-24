'use client';

import { useEffect, useState } from 'react';

/**
 * Notification event payload theo SSOT §2.7 (`event: notification`).
 * Shape flexible vì BE có thể bổ sung field cho từng loại notification.
 */
export interface NotificationStreamEvent {
  id: string;
  type: string;
  title?: string;
  body?: string;
  bookingId?: string;
  [key: string]: unknown;
}

interface UseNotificationStreamOptions {
  /** Bật/tắt subscription (mặc định true). */
  enabled?: boolean;
  /** Override URL — mặc định `/api/notifications/stream`. */
  url?: string;
}

/**
 * Subscribe Server-Sent Events từ `/api/notifications/stream`.
 *
 * Trả về event mới nhất + trạng thái connection. Hook tối thiểu — không buffer
 * lịch sử, không retry tự động (browser EventSource đã auto-reconnect). Caller
 * gắn vào UI (toast, badge) tự quyết.
 */
export function useNotificationStream(
  options: UseNotificationStreamOptions = {},
): {
  latest: NotificationStreamEvent | null;
  connected: boolean;
} {
  const { enabled = true, url = '/api/notifications/stream' } = options;
  const [latest, setLatest] = useState<NotificationStreamEvent | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    const es = new EventSource(url, { withCredentials: true });

    const handleOpen = () => setConnected(true);
    const handleError = () => setConnected(false);
    const handleMessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data) as NotificationStreamEvent;
        setLatest(data);
      } catch {
        // Bỏ qua message không phải JSON (vd heartbeat).
      }
    };

    es.addEventListener('open', handleOpen);
    es.addEventListener('error', handleError);
    es.addEventListener('notification', handleMessage as EventListener);
    // Fallback nếu BE dùng default `message` event.
    es.addEventListener('message', handleMessage);

    return () => {
      es.removeEventListener('open', handleOpen);
      es.removeEventListener('error', handleError);
      es.removeEventListener('notification', handleMessage as EventListener);
      es.removeEventListener('message', handleMessage);
      es.close();
      setConnected(false);
    };
  }, [enabled, url]);

  return { latest, connected };
}
