'use server';

import { revalidatePath } from 'next/cache';
import { bookingService } from '@/shared/services/bookingService';
import type {
  CancelBookingResponse,
  CancellationReason,
  CompleteBookingResponse,
} from '@/shared/types';

export type CancelBookingActionState =
  | { status: 'success'; data: CancelBookingResponse }
  | { status: 'error'; message: string };

export async function cancelBookingAction(
  bookingId: string,
  reason: CancellationReason = 'CANCELLATION_REASON_CLIENT_EARLY',
): Promise<CancelBookingActionState> {
  try {
    const data = await bookingService.cancelBooking(bookingId, reason);
    revalidatePath('/bookings');
    return { status: 'success', data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể hủy lịch hẹn. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}

export type CompleteBookingActionState =
  | { status: 'success'; data: CompleteBookingResponse }
  | { status: 'error'; message: string };

/**
 * Đánh dấu booking hoàn thành. Booking là user-specific data nên không có cache tag
 * granular — dùng revalidatePath cho trang list + detail.
 */
export async function completeBookingAction(
  bookingId: string,
): Promise<CompleteBookingActionState> {
  try {
    const data = await bookingService.completeBooking(bookingId);
    revalidatePath('/bookings');
    revalidatePath(`/bookings/${bookingId}`);
    return { status: 'success', data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không thể hoàn tất lịch hẹn. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}
