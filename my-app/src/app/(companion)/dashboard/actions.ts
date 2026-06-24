'use server';

import { bookingService } from '@/shared/services/bookingService';
import type {
  AcceptBookingResponse,
  CancelBookingResponse,
  CancellationReason,
  RejectBookingResponse,
} from '@/shared/types';

export async function acceptBookingAction(bookingId: string): Promise<AcceptBookingResponse> {
  return bookingService.acceptBooking(bookingId);
}

export async function rejectBookingAction(
  bookingId: string,
  reason: string = '',
): Promise<RejectBookingResponse> {
  return bookingService.rejectBooking(bookingId, reason);
}

export async function cancelBookingAction(
  bookingId: string,
  reason: CancellationReason = 'CANCELLATION_REASON_COMPANION_EARLY',
): Promise<CancelBookingResponse> {
  return bookingService.cancelBooking(bookingId, reason);
}
