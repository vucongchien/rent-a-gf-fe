import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** POST /api/bookings/:bookingId/reject — Từ chối booking (Companion) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  try {
    const body = (await req.json().catch(() => ({}))) as { reason?: string }
    const reason = typeof body?.reason === 'string' ? body.reason : ''
    const data = await bookingService.rejectBooking(bookingId, reason, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
