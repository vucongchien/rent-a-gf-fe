import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { notificationFetch } from '@/shared/lib/notificationApiClient';
import type {
  Notification,
  NotificationCategory,
  NotificationEventKind,
  NotificationPriority,
  NotificationsResponse,
  ServiceRequestOptions,
} from '@/shared/types';

// ─── Wire type — shape thực từ API BE ────────────────────────────────────────
type WireNotification = {
  id: string;
  userId?: string;
  /** eventId dạng "evt_booking_requested_123" — dùng để suy ra eventKind */
  eventId?: string;
  /** API field "type" = TRANSACTIONAL | MARKETING (không phải event type!) */
  type?: string;
  priority?: string;
  payload?: { title?: string; body?: string; bookingId?: string; [key: string]: unknown };
  status?: 'UNREAD' | 'READ';
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// ─── Helper: suy ra EventKind từ eventId prefix ───────────────────────────────
function deriveEventKind(eventId?: string): NotificationEventKind {
  if (!eventId) return 'SYSTEM';
  const id = eventId.toLowerCase();

  if (id.includes('booking_requested') || id.includes('booking_request')) return 'BOOKING_REQUESTED';
  if (id.includes('booking_accepted') || id.includes('booking_accept')) return 'BOOKING_ACCEPTED';
  if (id.includes('booking_rejected') || id.includes('booking_reject')) return 'BOOKING_REJECTED';
  if (id.includes('booking_cancelled') || id.includes('booking_cancel')) return 'BOOKING_CANCELLED';
  if (id.includes('booking_completed') || id.includes('booking_complete')) return 'BOOKING_COMPLETED';
  if (id.includes('chat')) return 'CHAT_MESSAGE';
  if (id.includes('payment_success') || id.includes('payment_ok')) return 'PAYMENT_SUCCESS';
  if (id.includes('payment_fail') || id.includes('payment_err')) return 'PAYMENT_FAILED';
  if (id.includes('dispute_open')) return 'DISPUTE_OPENED';
  if (id.includes('dispute_resolv')) return 'DISPUTE_RESOLVED';
  if (id.includes('review')) return 'NEW_REVIEW';
  if (id.includes('otp')) return 'OTP_CODE';
  if (id.includes('maintenance')) return 'SYSTEM_MAINTENANCE';
  if (id.includes('promotion') || id.includes('voucher')) return 'PROMOTION_VOUCHER';
  if (id.includes('profile')) return 'PROFILE_REMINDER';

  return 'SYSTEM';
}

// ─── Helper: sinh actionUrl từ bookingId / eventKind ─────────────────────────
function deriveActionUrl(eventKind: NotificationEventKind, bookingId?: string): string | undefined {
  if (bookingId) {
    switch (eventKind) {
      case 'BOOKING_REQUESTED':
        return `/dashboard/requests/${bookingId}`;
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_COMPLETED':
      case 'BOOKING_REJECTED':
      case 'BOOKING_CANCELLED':
        return `/bookings/${bookingId}`;
      default:
        break;
    }
  }
  if (eventKind === 'CHAT_MESSAGE') return '/messages';
  if (eventKind === 'PAYMENT_SUCCESS' || eventKind === 'PAYMENT_FAILED') return '/wallet';
  if (eventKind === 'DISPUTE_OPENED' || eventKind === 'DISPUTE_RESOLVED') return '/disputes';
  return undefined;
}

// ─── Helper: map wire → UI Notification ──────────────────────────────────────
function mapWireToNotification(n: WireNotification): Notification {
  const eventKind = deriveEventKind(n.eventId);
  const category = (n.type ?? 'TRANSACTIONAL') as NotificationCategory;
  const priority = (n.priority ?? 'MEDIUM') as NotificationPriority;
  const bookingId = n.payload?.bookingId;
  const actionUrl = deriveActionUrl(eventKind, bookingId);

  return {
    id: n.id,
    eventKind,
    category,
    priority,
    title: n.payload?.title ?? '',
    body: n.payload?.body ?? '',
    bookingId,
    isRead: n.readAt !== null && n.readAt !== undefined,
    createdAt: n.createdAt,
    actionUrl,
    // senderName / senderAvatar không có trong API docs mới → optional undefined
    senderName: undefined,
    senderAvatar: undefined,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const notificationService = {
  /**
   * GET /v1/notifications — Tải danh sách thông báo cursor-based.
   * Hỗ trợ params: cursor, limit, unreadOnly.
   */
  async getNotifications(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<NotificationsResponse> {
    const req = await getRequestCookieHeader(options?.req);

    const raw = await notificationFetch<{
      data: WireNotification[];
      paging?: { nextCursor?: string | null; hasMore?: boolean };
    }>('/notifications', {
      req,
      searchParams: options?.searchParams,
    });

    const items: Notification[] = (raw.data ?? []).map(mapWireToNotification);

    return {
      items,
      nextCursor: raw.paging?.nextCursor ?? null,
      hasMore: Boolean(raw.paging?.hasMore),
    };
  },

  /**
   * PATCH /v1/notifications/{id}/read → 204 No Content.
   */
  async markAsRead(notifId: string, options?: ServiceRequestOptions): Promise<{ success: boolean }> {
    const req = await getRequestCookieHeader(options?.req);

    // notificationFetch đã xử lý 204 → trả về undefined, không cần try/catch JSON.
    await notificationFetch<undefined>(`/notifications/${notifId}/read`, {
      req,
      method: 'PATCH',
    });

    return { success: true };
  },

  /**
   * PATCH /v1/notifications/read-all → `{ affectedRows: number }`.
   */
  async markAllAsRead(
    options?: ServiceRequestOptions,
  ): Promise<{ success: boolean; affectedRows: number }> {
    const req = await getRequestCookieHeader(options?.req);

    const raw = await notificationFetch<{ affectedRows?: number }>('/notifications/read-all', {
      req,
      method: 'PATCH',
    });

    return { success: true, affectedRows: raw?.affectedRows ?? 0 };
  },
};
