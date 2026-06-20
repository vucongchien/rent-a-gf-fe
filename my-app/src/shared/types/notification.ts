/**
 * notification.ts — Types cho Notification domain.
 */

export type NotificationCategory = 'TRANSACTIONAL' | 'INTERACTION' | 'PROMOTIONAL';

export type NotificationType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'CHAT_MESSAGE'
  | 'SYSTEM'
  | 'OTP_CODE'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'NEW_REVIEW'
  | 'SYSTEM_MAINTENANCE'
  | 'PROMOTION_VOUCHER'
  | 'PROFILE_REMINDER';

export interface Notification {
  id: string // Giữ nguyên "id" theo chuẩn SSE payload
  type: NotificationType
  category: NotificationCategory
  title: string
  body: string
  bookingId?: string
  isRead?: boolean
  createdAt?: string
  actionUrl?: string
  senderName?: string
  senderAvatar?: string
}
