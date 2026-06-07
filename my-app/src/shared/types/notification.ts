/**
 * notification.ts — Types cho Notification domain.
 */

export type NotificationType =
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'CHAT_MESSAGE'
  | 'SYSTEM'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  createdAt: string
  /** Optional link điều hướng khi bấm vào notification */
  actionUrl?: string
}
