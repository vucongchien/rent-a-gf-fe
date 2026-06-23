'use server';

import { revalidatePath } from 'next/cache';
import { bookingService } from '@/shared/services/bookingService';
import type { CancelBookingResponse } from '@/shared/types';

export type CancelBookingActionState =
  | { status: 'success'; data: CancelBookingResponse }
  | { status: 'error'; message: string };

export async function cancelBookingAction(bookingId: string): Promise<CancelBookingActionState> {
  try {
    const data = await bookingService.cancelBooking(bookingId);
    revalidatePath('/bookings');
    return { status: 'success', data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể hủy lịch hẹn. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}
