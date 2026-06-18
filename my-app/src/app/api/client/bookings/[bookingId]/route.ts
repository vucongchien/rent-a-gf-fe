import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/client/bookings/:bookingId — Chi tiết booking của client */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  try {
    const data = await bookingService.getClientBookingDetail(bookingId, { req })
    if (!data) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy booking' } }, { status: 404 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
