'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import type { Notification, NotificationEventKind, NotificationCategory, NotificationPriority } from '@/shared/types';

// ─── Normalize SSE wire payload → Notification shape ────────────────────────
// SSE event từ BE gửi raw wire format (không qua service layer),
// nên phải normalize ở đây trước khi dispatch vào UI.
function deriveEventKindFromId(eventId?: string): NotificationEventKind {
  if (!eventId) return 'SYSTEM';
  const id = eventId.toLowerCase();
  if (id.includes('booking_requested') || id.includes('booking_request')) return 'BOOKING_REQUESTED';
  if (id.includes('booking_accepted') || id.includes('booking_accept')) return 'BOOKING_ACCEPTED';
  if (id.includes('booking_rejected') || id.includes('booking_reject')) return 'BOOKING_REJECTED';
  if (id.includes('booking_cancelled') || id.includes('booking_cancel')) return 'BOOKING_CANCELLED';
  if (id.includes('booking_completed') || id.includes('booking_complete')) return 'BOOKING_COMPLETED';
  if (id.includes('chat')) return 'CHAT_MESSAGE';
  if (id.includes('payment_success') || id.includes('payment_ok')) return 'PAYMENT_SUCCESS';
  if (id.includes('payment_fail')) return 'PAYMENT_FAILED';
  if (id.includes('dispute_open')) return 'DISPUTE_OPENED';
  if (id.includes('dispute_resolv')) return 'DISPUTE_RESOLVED';
  if (id.includes('review')) return 'NEW_REVIEW';
  if (id.includes('otp')) return 'OTP_CODE';
  if (id.includes('maintenance')) return 'SYSTEM_MAINTENANCE';
  if (id.includes('promotion') || id.includes('voucher')) return 'PROMOTION_VOUCHER';
  if (id.includes('profile')) return 'PROFILE_REMINDER';
  return 'SYSTEM';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSSEPayload(raw: any): Notification {
  // Nếu đã là shape nội bộ (có eventKind) thì dùng luôn
  if (raw?.eventKind) return raw as Notification;

  // Wire format từ BE: { id, eventId, type, priority, payload, status, ... }
  const payload = raw?.payload ?? {};
  const eventKind = deriveEventKindFromId(raw?.eventId);
  return {
    id: raw?.id ?? '',
    eventKind,
    category: (raw?.type ?? 'TRANSACTIONAL') as NotificationCategory,
    priority: (raw?.priority ?? 'MEDIUM') as NotificationPriority,
    title: payload?.title ?? raw?.title ?? '',
    body: payload?.body ?? raw?.body ?? '',
    bookingId: payload?.bookingId,
    isRead: (raw?.readAt !== null && raw?.readAt !== undefined) || raw?.status === 'READ' || raw?.isRead === true,
    createdAt: raw?.createdAt,
    actionUrl: raw?.actionUrl,
    senderName: raw?.senderName,
    senderAvatar: raw?.senderAvatar,
  };
}

interface NotificationContextProps {
  unreadCount: number;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  fetchUnreadCount: () => Promise<void>;
  /** Trạng thái nguồn realtime: 'sse' khi EventSource active, 'polling' khi fallback. */
  realtimeSource: 'sse' | 'polling' | 'idle';
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

/** Số lần SSE error liên tiếp trước khi fallback sang polling. */
const SSE_ERROR_THRESHOLD = 3;
/** Polling interval (ms) khi SSE fail. */
const POLLING_INTERVAL_MS = 30_000;

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [realtimeSource, setRealtimeSource] = useState<'sse' | 'polling' | 'idle'>('idle');

  // 1. Fetch unread count ban đầu từ server (history)
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const unread = data.items.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('[NotificationContext] Lỗi fetch unread count:', err);
    }
  }, [user]);

  // Initial load khi user đổi
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }
      try {
        const res = await fetch('/api/notifications');
        if (res.ok && active) {
          const data = await res.json();
          const unread = data.items.filter((n: Notification) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('[NotificationContext] Lỗi fetch unread count:', err);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  /** Handler khi nhận notification mới (từ SSE hoặc polling diff). */
  const handleNewNotification = useCallback(
    (data: Notification) => {
      setUnreadCount((prev) => prev + 1);
      window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));

      if (typeof window !== 'undefined' && window.location.pathname !== '/notifications') {
        toast({
          title: data.title,
          message: data.body,
          variant: 'info',
          duration: 3500,
        });
      }
    },
    [toast],
  );

  // 2. SSE realtime với fallback polling
  const fallbackToPollingRef = useRef(false);
  const lastSeenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      // Đảm bảo reset source khi logout, nhưng tránh setState đồng bộ ở effect body
      // — schedule sang microtask để pass linter rule.
      queueMicrotask(() => setRealtimeSource('idle'));
      return;
    }

    let eventSource: EventSource | null = null;
    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let errorCount = 0;
    let cancelled = false;

    const startPolling = () => {
      if (pollingTimer || cancelled) return;
      fallbackToPollingRef.current = true;
      setRealtimeSource('polling');
      console.warn('[NotificationContext] SSE thất bại — fallback sang polling 30s.');

      // Khởi tạo snapshot id hiện tại để diff
      const seedSeen = async () => {
        try {
          const res = await fetch('/api/notifications');
          if (!res.ok) return;
          const data = await res.json();
          lastSeenIdsRef.current = new Set(
            (data.items as Notification[]).map((n) => n.id),
          );
        } catch {
          // ignore
        }
      };
      void seedSeen();

      pollingTimer = setInterval(async () => {
        if (cancelled) return;
        try {
          const res = await fetch('/api/notifications');
          if (!res.ok) return;
          const data = await res.json();
          const items = data.items as Notification[];
          const seen = lastSeenIdsRef.current;
          for (const n of items) {
            if (!seen.has(n.id)) {
              seen.add(n.id);
              if (!n.isRead) handleNewNotification(n);
            }
          }
        } catch (err) {
          console.error('[NotificationContext] Polling lỗi:', err);
        }
      }, POLLING_INTERVAL_MS);
    };

    const tryConnectSSE = () => {
      if (cancelled) return;
      try {
        eventSource = new EventSource('/api/notifications/stream');

        eventSource.addEventListener('open', () => {
          errorCount = 0;
          setRealtimeSource('sse');
        });

        const handleEvent = (event: MessageEvent) => {
          try {
            const raw = JSON.parse(event.data);
            // normalize wire format → Notification shape nội bộ
            const data = normalizeSSEPayload(raw);
            handleNewNotification(data);
          } catch (err) {
            console.error('[NotificationContext] Lỗi parse dữ liệu event:', err);
          }
        };

        eventSource.addEventListener('notification', handleEvent as EventListener);
        // Fallback nếu BE dùng default `message` event.
        eventSource.addEventListener('message', handleEvent);

        eventSource.onerror = (err) => {
          errorCount += 1;
          console.error(
            `[NotificationContext] SSE lỗi (${errorCount}/${SSE_ERROR_THRESHOLD})`,
            err,
          );
          if (errorCount >= SSE_ERROR_THRESHOLD && !fallbackToPollingRef.current) {
            // Đóng SSE và chuyển sang polling.
            eventSource?.close();
            eventSource = null;
            startPolling();
          }
        };
      } catch (err) {
        console.error('[NotificationContext] Không thể tạo SSE:', err);
        startPolling();
      }
    };

    if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
      tryConnectSSE();
    } else {
      // SSR / không hỗ trợ EventSource → polling luôn.
      startPolling();
    }

    return () => {
      cancelled = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
      fallbackToPollingRef.current = false;
      setRealtimeSource('idle');
    };
  }, [user, handleNewNotification]);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        decrementUnreadCount,
        resetUnreadCount,
        fetchUnreadCount,
        realtimeSource,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
