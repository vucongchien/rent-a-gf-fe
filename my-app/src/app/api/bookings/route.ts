import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/shared/services/bookingService'
import { toErrorPayload } from '@/shared/lib/apiClient'
import type { CreateBookingBody } from '@/shared/types'

/** GET /api/bookings — Danh sách booking của user hiện tại (Client hoặc Companion) */
export async function GET(req: NextRequest) {
  try {
    const data = await bookingService.getBookings({
      req,
      searchParams: req.nextUrl.searchParams,
    })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}

/** POST /api/bookings — Tạo booking mới */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateBookingBody
    const idempotencyKey = req.headers.get('x-idempotency-key')

    const result = await bookingService.createBooking(body, { req })

    const res = NextResponse.json(result, { status: 201 })
    if (idempotencyKey) res.headers.set('X-Idempotency-Key', idempotencyKey)
    return res
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
