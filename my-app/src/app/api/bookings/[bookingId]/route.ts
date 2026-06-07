import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/bookings/[bookingId] — Chi tiết 1 booking */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params
  try {
    const data = await bookingService.getBookingDetail(bookingId, { req })
    if (!data) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch hẹn' } },
        { status: 404 }
      )
    }
    return NextResponse.json({ data })
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
