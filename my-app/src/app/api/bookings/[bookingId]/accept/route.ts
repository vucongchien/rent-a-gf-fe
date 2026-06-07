import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** PATCH /api/bookings/[bookingId]/accept — Companion chấp nhận lịch */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params
  try {
    const data = await bookingService.acceptBooking(bookingId, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
