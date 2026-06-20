import { NextRequest, NextResponse } from 'next/server'
import { companionService } from '@/shared/services/companionService'
import { toErrorPayload } from '@/shared/lib/apiClient'

export async function GET(req: NextRequest) {
  try {
    const data = await companionService.getMyProfile({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await companionService.updateMyProfile(body, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
