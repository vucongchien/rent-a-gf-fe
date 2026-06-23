import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/shared/services/walletService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/**
 * POST /api/finance/topup — Khởi tạo nạp tiền qua VNPay.
 *
 * Idempotency: forward `x-idempotency-key` từ client xuống BE để chống
 * double-charge khi client retry. Echo lại header trong response như pattern
 * bookings (`app/api/bookings/route.ts`).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { amount: number }
    const idempotencyKey = req.headers.get('x-idempotency-key') ?? undefined

    const data = await walletService.initiateTopup(body, { req, idempotencyKey })

    const res = NextResponse.json(data)
    if (idempotencyKey) res.headers.set('X-Idempotency-Key', idempotencyKey)
    return res
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
