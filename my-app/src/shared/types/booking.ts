/**
 * booking.ts — Types cho Booking domain.
 */

import type { PaginatedMeta } from './api'

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'DISPUTED'

export interface ScenarioSnapshot {
  title: string
  price: number
  durationMinutes: number
  publicPlace: string
}

/** Item trong danh sách booking (dùng cho GET /bookings) */
export interface BookingListItem {
  bookingId: string
  partnerName: string
  partnerAvatar: string
  scenarioTitle: string
  price: number
  startTime: string
  chatRoomId: string | null
  hasReviewed: boolean
  status: BookingStatus
}

/** Chi tiết Booking (dùng cho GET /bookings/{bookingId}) */
export interface BookingDetail {
  bookingId: string
  clientId: string
  companionId: string
  scenarioSnapshot: ScenarioSnapshot
  startTime: string
  endTime: string
  status: BookingStatus
  chatRoomId: string | null
  chatRoomStatus: 'ACTIVE' | 'INACTIVE'
  hasReviewed: boolean
}

/** Request body tạo booking */
export interface CreateBookingBody {
  companionId: string
  scenarioId: string
  startTime: string
}

/** Phản hồi khi tạo booking thành công */
export interface CreateBookingResponse {
  bookingId: string
  clientId: string
  companionId: string
  scenarioSnapshot: ScenarioSnapshot
  startTime: string
  endTime: string
  status: BookingStatus
}

/** Phản hồi khi hủy booking thành công */
export interface CancelBookingResponse {
  bookingId: string
  status: 'CANCELLED'
  refundAmount: number
  compensationAmount: number
}

/** Phản hồi danh sách bookings có phân trang */
export interface BookingsResponse extends PaginatedMeta {
  bookings: BookingListItem[]
}
