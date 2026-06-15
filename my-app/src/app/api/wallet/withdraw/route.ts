import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/shared/services/walletService'
import { toErrorPayload } from '@/shared/lib/apiClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await walletService.withdraw(body, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
