'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import type { Notification } from '@/shared/types';

interface NotificationContextProps {
  unreadCount: number;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

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

  // 1. Fetch unread count ban đầu từ server
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

  // Tự động fetch lại khi user thay đổi
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

  // 2. Lắng nghe SSE từ backend
  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource;

    try {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data) as Notification;
          
          // Cập nhật số lượng chưa đọc
          setUnreadCount((prev) => prev + 1);

          // Phát ra custom event để UI list nhận biết
          window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));

          // Hiển thị Toast thông báo realtime nếu người dùng không ở trang notifications
          if (window.location.pathname !== '/notifications') {
            toast({
              message: (
                <div className="flex flex-col gap-0.5 text-left font-sans">
                  <span className="font-bold text-chizuru-400 text-xs uppercase tracking-wider">
                    {data.title}
                  </span>
                  <span className="text-white text-sm font-normal">
                    {data.body}
                  </span>
                </div>
              ),
              duration: 3500,
            });
          }
        } catch (err) {
          console.error('[NotificationContext] Lỗi parse dữ liệu event:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('[NotificationContext] Lỗi kết nối SSE, đang thử kết nối lại...', err);
      };
    } catch (err) {
      console.error('[NotificationContext] Không thể tạo kết nối SSE:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user, toast]);

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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
