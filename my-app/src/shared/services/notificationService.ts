import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationsResponse,
  ServiceRequestOptions,
} from '@/shared/types';

export const notificationService = {
  async getNotifications(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<NotificationsResponse> {
    const req = await getRequestCookieHeader(options?.req);

    type WireItem = {
      id: string;
      eventId?: string;
      type?: string;
      category?: string;
      priority?: string;
      status?: 'UNREAD' | 'READ';
      readAt?: string | null;
      createdAt?: string;
      payload?: { title?: string; body?: string; bookingId?: string };
      actionUrl?: string;
      senderName?: string;
      senderAvatar?: string;
    };
    const raw = await serverFetch<{
      data: WireItem[];
      paging?: { nextCursor?: string | null; hasMore?: boolean };
    }>('/notifications', {
      req,
      searchParams: options?.searchParams,
    });

    const items: Notification[] = (raw.data ?? []).map((n) => ({
      id: n.id,
      title: n.payload?.title ?? '',
      body: n.payload?.body ?? '',
      type: (n.type ?? 'SYSTEM') as NotificationType,
      category: (n.category ?? 'TRANSACTIONAL') as NotificationCategory,
      isRead: n.status === 'READ',
      createdAt: n.createdAt,
      bookingId: n.payload?.bookingId,
      actionUrl: n.actionUrl,
      senderName: n.senderName,
      senderAvatar: n.senderAvatar,
    }));

    return {
      items,
      nextCursor: raw.paging?.nextCursor ?? null,
      hasMore: Boolean(raw.paging?.hasMore),
    };
  },

  /**
   * SSOT: PATCH /notifications/{id}/read → 204 No Content (không có body).
   */
  async markAsRead(notifId: string, options?: ServiceRequestOptions): Promise<{ success: boolean }> {
    const req = await getRequestCookieHeader(options?.req);

    try {
      await serverFetch<unknown>(`/notifications/${notifId}/read`, {
        req,
        method: 'PATCH',
      });
    } catch (err) {
      const message = (err as { message?: string })?.message ?? '';
      const isEmptyBody = message.includes('Unexpected end') || message.includes('JSON');
      if (!isEmptyBody) throw err;
    }
    return { success: true };
  },

  /**
   * SSOT: PATCH /notifications/read-all → `{ affectedRows: number }`.
   */
  async markAllAsRead(
    options?: ServiceRequestOptions,
  ): Promise<{ success: boolean; affectedRows: number }> {
    const req = await getRequestCookieHeader(options?.req);

    const raw = await serverFetch<{ affectedRows?: number }>('/notifications/read-all', {
      req,
      method: 'PATCH',
    });
    return { success: true, affectedRows: raw?.affectedRows ?? 0 };
  }
};
