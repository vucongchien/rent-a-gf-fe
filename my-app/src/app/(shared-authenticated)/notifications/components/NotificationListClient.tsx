'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/shared/contexts/NotificationContext';
import { SakuraIcon, SpinnerIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';
import type { Notification, NotificationCategory, NotificationsResponse } from '@/shared/types';

interface NotificationListClientProps {
  initialNotifications: Notification[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
}

type TabType = 'ALL' | NotificationCategory;

export const NotificationListClient: React.FC<NotificationListClientProps> = ({
  initialNotifications,
  initialNextCursor,
  initialHasMore,
}) => {
  const { resetUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // 1. Lắng nghe thông báo realtime phát ra từ SSE Connection thông qua Custom Event
  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>;
      const newNotif = customEvent.detail;

      // Chèn lên đầu danh sách, tránh trùng lặp id
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    };

    window.addEventListener('new-notification', handleNewNotification);
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  // 2. Lọc thông báo dựa trên Tab hoạt động
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'ALL') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  // 3. Đánh dấu một thông báo đã đọc cục bộ (Optimistic update callback)
  const handleMarkAsReadLocal = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  // 4. Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    resetUnreadCount();

    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });
    } catch (err) {
      console.error('[NotificationListClient] Lỗi PATCH read-all:', err);
    }
  };

  // 5. Tải thêm thông báo (cursor-based)
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;
    setIsLoadingMore(true);

    try {
      const qs = new URLSearchParams({ cursor: nextCursor });
      const res = await fetch(`/api/notifications?${qs.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as NotificationsResponse;
        const newItems = data.items ?? [];

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const filteredNew = newItems.filter((n) => !existingIds.has(n.id));
          return [...prev, ...filteredNew];
        });

        setNextCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));
      }
    } catch (err) {
      console.error('[NotificationListClient] Lỗi fetch load more:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'TRANSACTIONAL', label: 'Giao dịch' },
    { id: 'INTERACTION', label: 'Tương tác' },
    { id: 'PROMOTIONAL', label: 'Hệ thống' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Tabs lọc & Hành động Đọc tất cả */}
      <div className="flex flex-col gap-3 pb-3 border-b border-neutral-100/60 px-4 md:px-0 pt-4 md:pt-0">
        {/* Navigation Tabs - Dàn đều 100% không cuộn ngang, style nút cũ tinh tế, chống giật bằng border-transparent */}
        <div className="flex w-full justify-between gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="unstyled"
                className={`py-1.5 px-1 text-[11px] sm:text-xs md:text-sm font-medium transition-all duration-200 rounded-xl flex-1 text-center truncate cursor-pointer ${
                  isActive
                    ? 'bg-chizuru-50/50 text-chizuru-600 border border-chizuru-100/30 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 border border-transparent'
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Nút Đọc tất cả - Dạt sang bên phải */}
        {notifications.some((n) => !n.isRead) && (
          <div className="flex justify-end">
            <Button
              onClick={handleMarkAllAsRead}
              variant="unstyled"
              className="text-xs font-semibold text-chizuru-600 hover:text-chizuru-700 transition-colors px-1 cursor-pointer"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        )}
      </div>

      {/* Danh sách các thông báo hiển thị */}
      {filteredNotifications.length > 0 ? (
        <div className="flex flex-col gap-3 px-4 md:px-0">
          {filteredNotifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkAsReadLocal={handleMarkAsReadLocal}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-4 px-4 pb-6 md:px-0 md:pb-0">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="unstyled"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
              >
                {isLoadingMore && <SpinnerIcon size={16} className="text-neutral-400" />}
                {isLoadingMore ? 'Đang tải...' : 'Xem các thông báo cũ hơn'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center mx-4 md:mx-0 rounded-2xl border border-dashed border-neutral-200 bg-white shadow-sm">
          <div className="w-16 h-16 rounded-full bg-chizuru-50/30 flex items-center justify-center mb-4">
            <SakuraIcon size={32} className="text-chizuru-300 opacity-80" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-800">Không có thông báo</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-[260px] leading-relaxed">
            Bạn không có thông báo nào trong danh mục này hoặc chưa phát sinh hoạt động nào.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationListClient;
