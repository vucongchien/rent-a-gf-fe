/**
 * notification.ts — Types cho Notification domain.
 *
 * SSOT API §GET /v1/notifications:
 *   - `type`     → TRANSACTIONAL | MARKETING  (phân loại ở server)
 *   - `priority` → LOW | MEDIUM | HIGH | CRITICAL
 *   - `payload`  → { title, body, bookingId? }  (nội dung động)
 *   - `eventId`  → dạng "evt_booking_requested_xxx"  (dùng để suy ra UI icon)
 *   - `status`   → UNREAD | READ
 */

/** Phân loại thông báo theo API (field `type`). */
export type NotificationCategory = 'TRANSACTIONAL' | 'MARKETING';

/** Mức độ ưu tiên theo API (field `priority`). */
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Loại sự kiện suy ra từ `eventId` prefix — dùng nội bộ để chọn icon/màu.
 * Không phải field trực tiếp từ API, được derive trong service.
 */
export type NotificationEventKind =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'CHAT_MESSAGE'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'NEW_REVIEW'
  | 'OTP_CODE'
  | 'SYSTEM_MAINTENANCE'
  | 'PROMOTION_VOUCHER'
  | 'PROFILE_REMINDER'
  | 'SYSTEM';

/** Notification đã được flatten từ API response — shape dùng trong UI. */
export interface Notification {
  /** UUID của notification. */
  id: string;
  /** Loại sự kiện suy ra từ eventId — dùng để chọn icon. */
  eventKind: NotificationEventKind;
  /** Phân loại theo API: TRANSACTIONAL | MARKETING. */
  category: NotificationCategory;
  /** Mức độ ưu tiên. */
  priority: NotificationPriority;
  /** Tiêu đề từ payload. */
  title: string;
  /** Nội dung từ payload. */
  body: string;
  /** BookingId từ payload (nếu có). */
  bookingId?: string;
  /** Đã đọc chưa (status === 'READ'). */
  isRead: boolean;
  createdAt?: string;
  /** URL điều hướng khi click (tự sinh từ bookingId hoặc eventKind). */
  actionUrl?: string;
  senderName?: string;
  senderAvatar?: string;
}

/**
 * Phản hồi danh sách notifications — cursor-based.
 * BE trả `{ data, paging:{ nextCursor, hasMore } }`;
 * service flatten `data[].payload` → `items[]`.
 */
export interface NotificationsResponse {
  items: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
}
