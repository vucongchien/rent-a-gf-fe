import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'
import type { CreateBookingBody } from '@/shared/types'

/** GET /api/client/bookings — Danh sách booking của client hiện tại */
export async function GET(req: NextRequest) {
  try {
    const { items, total, hasNextPage } = await bookingService.getClientBookings({
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

/** POST /api/client/bookings — Tạo booking mới */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateBookingBody
    const idempotencyKey = req.headers.get('x-idempotency-key')

    const result = await bookingService.createBooking(body, { req })

    const res = NextResponse.json({ data: result }, { status: 201 })
    if (idempotencyKey) res.headers.set('X-Idempotency-Key', idempotencyKey)
    return res
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
