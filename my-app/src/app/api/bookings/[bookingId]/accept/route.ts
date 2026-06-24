import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** POST /api/bookings/:bookingId/accept — Chấp nhận booking (Companion) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
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
