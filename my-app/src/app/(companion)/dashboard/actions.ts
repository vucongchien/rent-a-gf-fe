'use server';

import { bookingService } from '@/shared/services/bookingService';
import type { AcceptBookingResponse, CancelBookingResponse, RejectBookingResponse } from '@/shared/types';

export async function acceptBookingAction(bookingId: string): Promise<AcceptBookingResponse> {
  return bookingService.acceptBooking(bookingId);
}

export async function rejectBookingAction(bookingId: string): Promise<RejectBookingResponse> {
  return bookingService.rejectBooking(bookingId);
}

export async function cancelBookingAction(bookingId: string): Promise<CancelBookingResponse> {
  return bookingService.cancelBooking(bookingId);
}
