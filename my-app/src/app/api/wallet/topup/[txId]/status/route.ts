import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/shared/services/walletService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/wallet/topup/[txId]/status — Poll trạng thái thanh toán VNPay */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txId: string }> },
) {
  const { txId } = await params
  try {
    const data = await walletService.getTopupStatus(txId, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
