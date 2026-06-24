import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'
import type { CancellationReason } from '@/shared/types'

const VALID_REASONS: CancellationReason[] = [
  'CANCELLATION_REASON_CLIENT_EARLY',
  'CANCELLATION_REASON_CLIENT_LATE',
  'CANCELLATION_REASON_COMPANION_EARLY',
  'CANCELLATION_REASON_COMPANION_LATE',
]

/** POST /api/bookings/:bookingId/cancel — Hủy booking */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  try {
    const body = (await req.json().catch(() => ({}))) as { reason?: string }
    const reason = (VALID_REASONS as string[]).includes(body?.reason ?? '')
      ? (body.reason as CancellationReason)
      : 'CANCELLATION_REASON_CLIENT_EARLY'
    const data = await bookingService.cancelBooking(bookingId, reason, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
