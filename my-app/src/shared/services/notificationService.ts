import { serverFetch } from '@/shared/lib/apiClient';
import { mockNotifications } from '@/mocks/fixtures/data';
import type { Notification, NotificationType, ApiResponse, ServiceRequestOptions } from '@/shared/types';
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
  }): Promise<ApiResponse<{
    items: Notification[];
    meta: { page: number; limit: number; total: number; hasNextPage: boolean };
  }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const items: Notification[] = mockNotifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: (n.variant === 'booking' ? 'BOOKING_ACCEPTED' : 'SYSTEM') as NotificationType,
        isRead: n.isRead,
        createdAt: n.receivedAt,
        actionUrl: n.actionUrl,
      }));
      return {
        data: {
          items,
          meta: {
            page: 1,
            limit: 20,
            total: mockNotifications.length,
            hasNextPage: false,
          }
        }
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ApiResponse<{
        items: Notification[];
        meta: { page: number; limit: number; total: number; hasNextPage: boolean };
      }>>('/notifications', {
        req,
        searchParams: options?.searchParams,
      });
    } catch (err) {
      console.error('[notificationService] Lỗi fetch notifications:', err);
      throw err;
    }
  },

  /**
   * Đánh dấu đã đọc một thông báo
   */
  async markAsRead(notifId: string, options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const found = mockNotifications.find(n => n.id === notifId);
      if (found) found.isRead = true;
      return { data: { success: true } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean }>>(`/notifications/${notifId}/read`, {
      req,
      method: 'PATCH',
    });
  },

  /**
   * Đánh dấu đã đọc tất cả thông báo
   */
  async markAllAsRead(options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      mockNotifications.forEach(n => { n.isRead = true; });
      return { data: { success: true } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean }>>('/notifications/read-all', {
      req,
      method: 'PATCH',
    });
  }
};
