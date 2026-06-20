/**
 * notification.ts — Types cho Notification domain.
 */

export type NotificationType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'CHAT_MESSAGE'
  | 'SYSTEM'

export interface Notification {
  id: string // Giữ nguyên "id" theo chuẩn SSE payload
  type: NotificationType
  title: string
  body: string
  bookingId?: string
  isRead?: boolean
  createdAt?: string
}
