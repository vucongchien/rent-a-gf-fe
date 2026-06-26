import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/shared/services/walletService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/finance/transactions — Compatibility endpoint; BE OpenAPI chưa expose transactions. */
export async function GET(req: NextRequest) {
  try {
    const data = await walletService.getTransactions({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
