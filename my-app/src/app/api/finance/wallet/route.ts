import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/shared/services/walletService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/finance/wallet — Lấy thông tin ví */
export async function GET(req: NextRequest) {
  try {
    const data = await walletService.getWallet({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
