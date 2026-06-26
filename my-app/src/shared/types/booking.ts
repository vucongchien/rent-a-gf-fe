/**
 * booking.ts — Types cho Booking domain.
 */

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
}

/** Item trong danh sách booking (dùng cho GET /bookings) */
export interface BookingListItem {
  bookingId: string
  partnerName: string
  partnerAvatar: string
  scenarioTitle: string
  price: number
  startTime: string
  endTime: string
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

/** Phản hồi khi Companion accept booking */
export interface AcceptBookingResponse {
  bookingId: string
  status: string
  chatRoomId: string
}

/** Phản hồi khi Companion reject booking */
export interface RejectBookingResponse {
  bookingId: string
  status: string
}

/** Phản hồi khi complete booking (SSOT: POST /bookings/{id}/complete) */
export interface CompleteBookingResponse {
  bookingId: string
  status: string
  message: string
}

/** Mã lý do hủy booking (SSOT enum). */
export type CancellationReason =
  | 'CANCELLATION_REASON_CLIENT_EARLY'
  | 'CANCELLATION_REASON_CLIENT_LATE'
  | 'CANCELLATION_REASON_COMPANION_EARLY'
  | 'CANCELLATION_REASON_COMPANION_LATE'

/**
 * Phản hồi danh sách bookings — cursor-based (SSOT api_draft §2.3).
 * BE trả `{ bookings, nextPageToken }`. `nextPageToken === null` ⇒ hết trang.
 */
export interface BookingsResponse {
  bookings: BookingListItem[]
  nextPageToken: string | null
}
