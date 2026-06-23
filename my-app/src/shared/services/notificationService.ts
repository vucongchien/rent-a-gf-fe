import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { mockNotifications } from '@/mocks/fixtures/data';
import type { Notification, NotificationType, NotificationCategory, ServiceRequestOptions } from '@/shared/types';

export const notificationService = {
  /**
   * Lấy danh sách thông báo của user hiện tại.
   *
   * KHÔNG cache (user-specific) — AGENTS.md 2026-06: cấm `'use cache'` cho user data.
   * BE đọc JWT từ Bearer header để scope theo user.
   */
  async getNotifications(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<{
    items: Notification[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    if (isMockMode()) {
      const items: Notification[] = mockNotifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type as NotificationType,
        category: n.category as NotificationCategory,
        isRead: n.isRead,
        createdAt: n.createdAt,
        bookingId: n.bookingId,
        actionUrl: n.actionUrl,
        senderName: n.senderName,
        senderAvatar: n.senderAvatar,
      }));
      return {
        items,
        total: mockNotifications.length,
        page: 1,
        pageSize: 20
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<{
        items: Notification[];
        total: number;
        page: number;
        pageSize: number;
      }>('/notifications', {
        req,
        searchParams: options?.searchParams,
      });
    } catch (err: unknown) {
      console.error('[notificationService] Lỗi fetch notifications:', err);
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  /**
   * Đánh dấu đã đọc một thông báo
   */
  async markAsRead(notifId: string, options?: ServiceRequestOptions): Promise<{ success: boolean }> {
    if (isMockMode()) {
      const found = mockNotifications.find(n => n.id === notifId);
      if (found) found.isRead = true;
      return { success: true };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<{ success: boolean }>(`/notifications/${notifId}/read`, {
      req,
      method: 'PATCH',
    });
  },

  /**
   * Đánh dấu đã đọc tất cả thông báo
   */
  async markAllAsRead(options?: ServiceRequestOptions): Promise<{ success: boolean }> {
    if (isMockMode()) {
      mockNotifications.forEach(n => { n.isRead = true; });
      return { success: true };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<{ success: boolean }>('/notifications/read-all', {
      req,
      method: 'PATCH',
    });
  }
};
