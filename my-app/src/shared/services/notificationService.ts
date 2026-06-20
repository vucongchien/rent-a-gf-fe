import { serverFetch } from '@/shared/lib/apiClient';
import { mockNotifications } from '@/mocks/fixtures/data';
import type { Notification, NotificationType, ServiceRequestOptions } from '@/shared/types';
import { cookies } from 'next/headers';

async function getRequestCookieHeader(req?: { headers: { get(name: string): string | null } }) {
  if (req) return req;
  try {
    const cookieStore = await cookies();
    return {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'cookie') {
            return cookieStore.toString();
          }
          return null;
        }
      }
    };
  } catch {
    return undefined;
  }
}

export const notificationService = {
  /**
   * Lấy danh sách thông báo của user
   */
  async getNotifications(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<{
    items: Notification[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const items: Notification[] = mockNotifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type as NotificationType,
        isRead: n.isRead,
        createdAt: n.createdAt,
        bookingId: n.bookingId,
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
    } catch (err) {
      console.error('[notificationService] Lỗi fetch notifications:', err);
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  /**
   * Đánh dấu đã đọc một thông báo
   */
  async markAsRead(notifId: string, options?: ServiceRequestOptions): Promise<{ success: boolean }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const found = mockNotifications.find(n => n.id === notifId);
      if (found) found.isRead = true;
      return { success: true };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<{ success: boolean }>(`/notifications/${notifId}/read`, {
      req,
      method: 'PUT',
    });
  },

  /**
   * Đánh dấu đã đọc tất cả thông báo
   */
  async markAllAsRead(options?: ServiceRequestOptions): Promise<{ success: boolean }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      mockNotifications.forEach(n => { n.isRead = true; });
      return { success: true };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<{ success: boolean }>('/notifications/read-all', {
      req,
      method: 'PUT',
    });
  }
};

