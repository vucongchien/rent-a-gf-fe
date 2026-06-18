import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/companion/bookings — Danh sách booking được đặt cho companion hiện tại */
export async function GET(req: NextRequest) {
  try {
    const { items, total, hasNextPage } = await bookingService.getCompanionBookings({
      req,
      searchParams: req.nextUrl.searchParams,
    })
    return NextResponse.json({
      data: {
        items,
        meta: { total, hasNextPage }
      }
    })
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
