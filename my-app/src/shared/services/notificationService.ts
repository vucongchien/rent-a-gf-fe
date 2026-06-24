import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { mockNotifications } from '@/mocks/fixtures/data';
import type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationsResponse,
  ServiceRequestOptions,
} from '@/shared/types';

export const notificationService = {
  /**
   * Lấy danh sách thông báo của user hiện tại (cursor-based, SSOT §2.7).
   *
   * KHÔNG cache (user-specific) — AGENTS.md: cấm `'use cache'` cho user data.
   * BE đọc JWT từ Bearer header để scope theo user.
   *
   * Query params (forward via searchParams):
   *  - `cursor`: chuỗi cursor từ lần gọi trước (rỗng = trang đầu).
   *  - `limit`: số bản ghi tối đa (mặc định 20, max 100).
   *  - `unreadOnly`: lọc tin chưa đọc.
   */
  async getNotifications(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<NotificationsResponse> {
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
      // Mock dataset nhỏ → trả luôn hết, hasMore=false.
      return { items, nextCursor: null, hasMore: false };
    }

    const req = await getRequestCookieHeader(options?.req);

    // SSOT: `{ data: [{ id, payload:{title,body,bookingId}, status, ... }], paging:{nextCursor, hasMore} }`.
    // Flatten `payload` ra Notification để UI giữ shape cũ.
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
   * Đánh dấu đã đọc một thông báo.
   * SSOT: PATCH /notifications/{id}/read → 204 No Content (không có body).
   * Ta gọi serverFetch trong try/catch và bỏ qua lỗi parse JSON do body rỗng,
   * trả `{ success: true }` cho UI.
   */
  async markAsRead(notifId: string, options?: ServiceRequestOptions): Promise<{ success: boolean }> {
    if (isMockMode()) {
      const found = mockNotifications.find(n => n.id === notifId);
      if (found) found.isRead = true;
      return { success: true };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      await serverFetch<unknown>(`/notifications/${notifId}/read`, {
        req,
        method: 'PATCH',
      });
    } catch (err) {
      // SSOT trả 204 No Content → serverFetch parse JSON fail. Chấp nhận nếu nguyên
      // nhân là parse rỗng (SyntaxError) — vẫn coi là success.
      const message = (err as { message?: string })?.message ?? '';
      const isEmptyBody = message.includes('Unexpected end') || message.includes('JSON');
      if (!isEmptyBody) throw err;
    }
    return { success: true };
  },

  /**
   * Đánh dấu đã đọc tất cả thông báo.
   * SSOT: PATCH /notifications/read-all → `{ affectedRows: number }`.
   */
  async markAllAsRead(
    options?: ServiceRequestOptions,
  ): Promise<{ success: boolean; affectedRows: number }> {
    if (isMockMode()) {
      const affected = mockNotifications.filter(n => !n.isRead).length;
      mockNotifications.forEach(n => { n.isRead = true; });
      return { success: true, affectedRows: affected };
    }

    const req = await getRequestCookieHeader(options?.req);

    const raw = await serverFetch<{ affectedRows?: number }>('/notifications/read-all', {
      req,
      method: 'PATCH',
    });
    return { success: true, affectedRows: raw?.affectedRows ?? 0 };
  }
};
