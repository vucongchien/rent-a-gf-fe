import { NextRequest, NextResponse } from 'next/server'
import { companionService } from '@/shared/services/companionService'
import { toErrorPayload } from '@/shared/lib/apiClient'

export async function POST(req: NextRequest) {
  try {
    const data = await companionService.applyCompanion({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
