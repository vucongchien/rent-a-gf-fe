export type BookingActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; bookingId: string }
