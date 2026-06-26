import { NextRequest, NextResponse } from 'next/server'
import { companionService } from '@/shared/services/companionService'
import { toErrorPayload } from '@/shared/lib/apiClient'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { reason?: string }
    const reason = typeof body?.reason === 'string' ? body.reason : ''
    const data = await companionService.applyCompanion({ reason }, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
