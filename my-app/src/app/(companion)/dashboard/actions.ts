'use server';

import { bookingService } from '@/shared/services/bookingService';

export async function acceptBookingAction(bookingId: string) {
  return bookingService.acceptBooking(bookingId);
}

export async function rejectBookingAction(bookingId: string) {
  return bookingService.rejectBooking(bookingId);
}
