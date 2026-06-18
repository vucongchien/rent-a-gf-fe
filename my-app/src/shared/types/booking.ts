/**
 * booking.ts — Types cho Booking domain.
 */

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_PROGRESS'

export type EscrowStatus = 'frozen' | 'released' | 'refunded'

export interface Booking {
  id: string
  clientId: string
  clientName: string
  clientAvatarUrl: string
  companionId: string
  companionName: string
  companionAvatarUrl: string
  scenarioName: string
  scheduledAt: string
  endsAt: string
  status: BookingStatus
  priceInCoin: number
  chatRoomId: string | null
  scenarioLocation: string
  escrowStatus: EscrowStatus
  isFundsReleased?: boolean
}

/** Kết quả tạo booking mới */
export interface CreateBookingResult {
  id: string
  status: BookingStatus
  frozenCoin: number
}

/** Body gửi khi tạo booking */
export interface CreateBookingBody {
  companionId: string
  scenarioId: string
  scheduledAt: string
  note?: string
}
