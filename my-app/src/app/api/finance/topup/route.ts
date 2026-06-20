import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/shared/services/walletService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** POST /api/finance/topup — Khởi tạo nạp tiền qua VNPay */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { amount: number }
    const data = await walletService.initiateTopup(body, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
