'use server';

import { revalidatePath } from 'next/cache';
import { bookingService } from '@/shared/services/bookingService';
import type {
  AcceptBookingResponse,
  CancelBookingResponse,
  CancellationReason,
  RejectBookingResponse,
} from '@/shared/types';

export type BookingActionState<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export async function acceptBookingAction(
  bookingId: string,
): Promise<BookingActionState<AcceptBookingResponse>> {
  try {
    const data = await bookingService.acceptBooking(bookingId);
    revalidatePath('/dashboard/requests');
    revalidatePath(`/dashboard/requests/${bookingId}`);
    return { status: 'success', data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể chấp nhận yêu cầu. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}

export async function rejectBookingAction(
  bookingId: string,
  reason: string = '',
): Promise<BookingActionState<RejectBookingResponse>> {
  try {
    const data = await bookingService.rejectBooking(bookingId, reason);
    revalidatePath('/dashboard/requests');
    revalidatePath(`/dashboard/requests/${bookingId}`);
    return { status: 'success', data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể từ chối yêu cầu. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}

export async function cancelBookingAction(
  bookingId: string,
  reason: CancellationReason = 'CANCELLATION_REASON_COMPANION_EARLY',
): Promise<BookingActionState<CancelBookingResponse>> {
  try {
    const data = await bookingService.cancelBooking(bookingId, reason);
    revalidatePath('/dashboard/requests');
    revalidatePath(`/dashboard/requests/${bookingId}`);
    return { status: 'success', data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể hủy lịch hẹn. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}
